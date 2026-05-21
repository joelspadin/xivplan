import type { Vector2d } from 'konva/lib/types';
import { getAbsolutePosition, getAbsoluteRotation, isWithinBox, isWithinRadius, makeRelative } from './coord';
import { ConnectionType } from './EditModeContext';
import { LayerName } from './render/layers';
import { getLayerName } from './render/ObjectRegistry';
import {
    isIcon,
    isMoveable,
    isRadiusObject,
    isResizable,
    isRotateable,
    type MoveableObject,
    ObjectType,
    type Scene,
    type SceneObject,
    type SceneStep,
    type UnknownObject,
} from './scene';
import {
    getDirectPositionDescendants,
    getObjectById,
    getStepIndexForId,
    type SceneAction,
    useScene,
} from './SceneProvider';
import { selectNone, useSpotlight } from './selection';
import { useConnectionSelection } from './useConnectionSelection';
import { type Enum, omit } from './util';

/**
 * Returns the ConnectionType-appropriate functions to get the current connection ID for a single object,
 * and the allowed connection IDs for a selection of objects.
 */
export function getConnectionIdFuncs(
    connectionType: ConnectionType,
): [
    (obj: SceneObject) => number | undefined,
    (scene: Scene, objectsToConnect: readonly SceneObject[]) => ReadonlySet<number>,
] {
    switch (connectionType) {
        case ConnectionType.POSITION:
            return [getPositionParentId, getAllowedPositionParentIds];
        case ConnectionType.ROTATION:
            return [getRotationConnectionId, getAllowedRotationConnectionIds];
    }
}

export function getPositionParentId(obj: SceneObject | undefined) {
    return isMoveable(obj) ? obj.positionParentId : undefined;
}

export function getRotationConnectionId(obj: SceneObject | undefined) {
    return isRotateable(obj) ? obj.facingId : undefined;
}

export function useIsAllowedConnectionTarget(id: number): boolean {
    const allowedConnectionIds = useAllowedConnectionIds();
    return allowedConnectionIds.has(id);
}

export function useAllowedConnectionIds(): ReadonlySet<number> {
    const { scene } = useScene();
    const [connectionSelection] = useConnectionSelection();
    const objectIdsToConnect = connectionSelection.objectIdsToConnect;

    switch (connectionSelection.connectionType) {
        case ConnectionType.POSITION:
            return getAllowedPositionParentIds(
                scene,
                scene.steps.flatMap((s) => s.objects).filter((obj) => objectIdsToConnect.has(obj.id)),
            );
        case ConnectionType.ROTATION: {
            return getAllowedRotationConnectionIds(
                scene,
                scene.steps.flatMap((s) => s.objects).filter((obj) => objectIdsToConnect.has(obj.id)),
            );
        }
    }
}

/**
 * @returns a list of object IDs in the current step that the given selection of objects is allowed to have as
 * position parent. This excludes the selection plus any of its position descendants.
 */
export function getAllowedPositionParentIds(
    scene: Scene,
    objectsToConnect: readonly SceneObject[],
): ReadonlySet<number> {
    if (objectsToConnect.length == 0) {
        return new Set();
    }
    const selectedAndChildren = new Set<number>(objectsToConnect.map((obj) => obj.id));
    let addedObjects = objectsToConnect.length;
    const allObjects = scene.steps.flatMap((s) => s.objects);

    while (addedObjects > 0) {
        addedObjects = 0;
        allObjects.forEach((obj) => {
            if (selectedAndChildren.has(obj.id)) {
                return;
            }
            if (
                isMoveable(obj) &&
                obj.positionParentId !== undefined &&
                selectedAndChildren.has(obj.positionParentId)
            ) {
                selectedAndChildren.add(obj.id);
                addedObjects++;
            }
        });
    }

    const isAllowed = (obj: SceneObject) => isMoveable(obj) && !selectedAndChildren.has(obj.id);
    return new Set(allObjects.filter(isAllowed).map((obj) => obj.id));
}

/**
 * @returns a list of object IDs in the current step that the given selection of objects is allowed to face.
 * This only excludes the selection -- it's OK to face an attached object or objects that face the selection.
 */
export function getAllowedRotationConnectionIds(
    scene: Scene,
    objectsToConnect: readonly SceneObject[],
): ReadonlySet<number> {
    if (objectsToConnect.length == 0) {
        return new Set();
    }
    const selectedIds = new Set<number>(objectsToConnect.map((obj) => obj.id));

    const isAllowed = (obj: SceneObject) => isMoveable(obj) && !selectedIds.has(obj.id);
    return new Set(
        scene.steps
            .flatMap((s) => s.objects)
            .filter(isAllowed)
            .map((obj) => obj.id),
    );
}

/**
 * @returns a filtered list of the input objects that has any objects removed that are positionally attached to
 * another object in the list (directly or indirectly).
 */
export function omitInterconnectedObjects(
    scene: Scene,
    objects: (SceneObject & MoveableObject)[],
): (SceneObject & MoveableObject)[] {
    const objectIds = new Set(objects.map((obj) => obj.id));
    return objects.filter((obj) => {
        let positionParentId = obj.positionParentId;
        while (positionParentId !== undefined) {
            if (objectIds.has(positionParentId)) {
                return false;
            }
            const parent = getObjectById(scene, positionParentId);
            positionParentId = getPositionParentId(parent);
        }
        return true;
    });
}

/**
 * Returns a function that yields SceneActions to update the given object as the chosen connected ID,
 * determined by the values in the ConnectionSelectionContext. The actions must be dispatched in the provided order.
 */
export function useUpdateConnectedIdsActions(): (newParent: SceneObject & MoveableObject) => SceneAction[] {
    const { scene, stepIndex } = useScene();
    const [{ objectIdsToConnect, connectionType }] = useConnectionSelection();
    const [, setSpotlight] = useSpotlight();

    if (objectIdsToConnect.size == 0) {
        return () => [];
    }

    return (newParent: SceneObject & MoveableObject) => {
        const actions: SceneAction[] = [];

        // If necessary, switch back to the step that has the objects to connect so that the
        // update action can take hold and the effect of the connection is visible.
        const connectingStepIndex = getStepIndexForId(scene, objectIdsToConnect.values().next().value);
        if (connectingStepIndex === undefined) {
            // Shouldn't happen, but just move on without doing anything instead of crashing.
            return [];
        }
        if (connectingStepIndex != stepIndex) {
            actions.push({ type: 'setStep', index: connectingStepIndex });
            // there will be no onMouseLeave when switching steps, so clear the spotlight manually.
            setSpotlight(selectNone());
        }
        switch (connectionType) {
            case ConnectionType.POSITION: {
                actions.push(createUpdatePositionParentIdsAction(objectIdsToConnect, newParent));
                break;
            }
            case ConnectionType.ROTATION: {
                actions.push(createUpdateRotationParentIdsAction(objectIdsToConnect, newParent));
                break;
            }
        }

        return actions;
    };
}

function createUpdateRotationParentIdsAction(
    objectIdsToConnect: ReadonlySet<number>,
    newParent: SceneObject & MoveableObject,
): SceneAction {
    return {
        type: 'transform',
        ids: [...objectIdsToConnect],
        transformFn: (obj) => {
            if (!isRotateable(obj)) {
                return obj;
            }
            // always face the newly-connected target object by default.
            return { ...obj, facingId: newParent.id, rotation: 0 };
        },
    };
}

function createUpdatePositionParentIdsAction(
    objectIdsToConnect: ReadonlySet<number>,
    newParent: SceneObject & MoveableObject,
): SceneAction {
    return {
        type: 'transform',
        ids: [...objectIdsToConnect.values()],
        transformFn: (obj, scene) => {
            if (!isMoveable(obj)) {
                return obj;
            }
            const attachmentSettings = getAttachmentSettings(obj, scene, objectIdsToConnect);
            const newRelativePos = getRelativeAttachmentPoint(
                scene,
                { ...obj, ...getAbsolutePosition(scene, obj) },
                newParent,
                attachmentSettings.location,
            );
            return {
                ...obj,
                positionParentId: newParent.id,
                ...newRelativePos,
                // Pin objects that got moved to a default position
                pinned: getNewPinnedState(obj, attachmentSettings),
            };
        },
    };
}

/**
 * Calculates the new 'pinned' state after attaching an object. If the object didn't move
 * during the attachment, keep the current state. Otherwise potentially pin it based on
 * the default attachment settings.
 */
function getNewPinnedState(obj: MoveableObject, attachmentSettings: AttachmentSettings): boolean | undefined {
    switch (attachmentSettings.location) {
        case DefaultAttachPosition.ANYWHERE:
        case DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT:
            return obj.pinned;
        default:
            // Make sure to keep pinned objects pinned, even if the default settings don't pin it.
            return obj.pinned || attachmentSettings.pinByDefault;
    }
}

function getAttachmentSettings(
    obj: SceneObject,
    scene: Scene,
    objectIdsToConnect: ReadonlySet<number>,
): AttachmentSettings {
    const attachmentSettings = getDefaultAttachmentSettings(obj);
    // If more than one object would get moved to the same spot, just leave them where they are to
    // avoid full overlaps and ambiguous orderings. Center-attachments are fine to overlap.
    // TODO: figure out what the expected behavior is for top & bottom-right. is arbitrary ordering fine?
    if (attachmentSettings.location != DefaultAttachPosition.CENTER) {
        for (const otherConnectingId of objectIdsToConnect) {
            if (otherConnectingId != obj.id) {
                const otherConnectingObj = getObjectById(scene, otherConnectingId);
                if (
                    otherConnectingObj &&
                    getDefaultAttachmentSettings(otherConnectingObj).location === attachmentSettings.location
                ) {
                    attachmentSettings.location = DefaultAttachPosition.ANYWHERE;
                    break;
                }
            }
        }
    }
    return attachmentSettings;
}

export const DefaultAttachPosition = {
    DONT_ATTACH_BY_DEFAULT: 0,
    ANYWHERE: 1,
    CENTER: 2,
    TOP: 3,
    BOTTOM_RIGHT: 4,
} as const;
export type DefaultAttachPosition = Enum<typeof DefaultAttachPosition>;

export type AttachmentSettings = {
    location: DefaultAttachPosition;
    pinByDefault: boolean;
};

/** @returns Where the given object 'prefers' to be attached to a positional parent. */
export function getDefaultAttachmentSettings(object: UnknownObject): AttachmentSettings {
    switch (object.type) {
        case ObjectType.Arc:
        case ObjectType.Arrow:
        case ObjectType.Cone:
        case ObjectType.Donut:
        case ObjectType.Line:
        case ObjectType.LineStack:
        case ObjectType.Proximity:
        case ObjectType.Stack:
            // TODO: only pin the position by default
            return { location: DefaultAttachPosition.CENTER, pinByDefault: false };
        case ObjectType.Icon: {
            // Markers and status effects are both ObjectType.Icon. Only status effects have an icon ID.
            if (isIcon(object) && object.iconId !== undefined) {
                return { location: DefaultAttachPosition.BOTTOM_RIGHT, pinByDefault: true };
            }
            return { location: DefaultAttachPosition.TOP, pinByDefault: true };
        }
        default:
            return { location: DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT, pinByDefault: false };
    }
}

export const AttachmentDropTarget = {
    NONE: 0,
    SELF: 1,
    PARENT: 2,
} as const;
export type AttachmentDropTarget = Enum<typeof AttachmentDropTarget>;

export function isValidAttachmentDropTarget(object: SceneObject): AttachmentDropTarget {
    switch (object.type) {
        case ObjectType.Party:
        case ObjectType.Enemy:
            // These are the most-common attachment targets, and also have a 'full' shape to make
            // drop target checking simpler (see getObjectToAttachToAt())
            return AttachmentDropTarget.SELF;
        case ObjectType.Icon:
            // Dropping something on a marker or status icon should count as if dropping it on the
            // positional parent (if any) for the purposes of attaching by default.
            return AttachmentDropTarget.PARENT;
        default:
            return AttachmentDropTarget.NONE;
    }
}

/**
 * @returns the 'topmost' rendered object at the given position in the scene that accepts objects
 * being positionally attached to it by default.
 */
export function getObjectToAttachToAt(scene: Scene, step: SceneStep, pos: Vector2d): SceneObject | undefined {
    // (mouse-enter events are not triggering while dragging something, so unless Konva has an
    // "object at this position" function somewhere that we can also call from here, we need to do this manually)
    let matchedObject: SceneObject | undefined = undefined;
    // The party is rendered at a higher layer than other object types even if the scene order puts them
    // in the back, so go through objects layer by layer instead of relying solely on the scene order.
    for (const layer of Object.values(LayerName)) {
        for (const o of step.objects) {
            if (getLayerName(o) !== layer) {
                continue;
            }
            const dropTarget = isValidAttachmentDropTarget(o);
            if (dropTarget == AttachmentDropTarget.NONE) {
                continue;
            }
            // Don't attach to hidden objects to avoid surprises
            if (o.hide) {
                continue;
            }
            if (hitTest(scene, o, pos)) {
                if (dropTarget == AttachmentDropTarget.SELF) {
                    matchedObject = o;
                } else if (dropTarget == AttachmentDropTarget.PARENT) {
                    // If the object is an attachment itself, and the parent does allow attaching,
                    // attach to that instead.
                    if (isMoveable(o) && o.positionParentId !== undefined) {
                        const parentObject = getObjectById(scene, o.positionParentId);
                        if (
                            isMoveable(parentObject) &&
                            isValidAttachmentDropTarget(parentObject) == AttachmentDropTarget.SELF
                        ) {
                            matchedObject = parentObject;
                        }
                    }
                }
            }
        }
    }
    return matchedObject;
}

/**
 * Calculate whether the given position is inside the given object.
 *
 * Only some basic shapes are supported right now, as only objects with these basic shapes can be attached to by default.
 */
function hitTest(scene: Scene, obj: SceneObject, pos: Vector2d): boolean {
    if (isRadiusObject(obj)) {
        return isWithinRadius({ ...obj, ...getAbsolutePosition(scene, obj) }, pos);
    }
    if (isResizable(obj)) {
        return isWithinBox({ ...obj, ...getAbsolutePosition(scene, obj) }, pos);
    }
    return false;
}

/**
 * @returns the position, relative to the given parent, to place the given object given its
 * default attachment preferences.
 */
export function getRelativeAttachmentPoint(
    scene: Scene,
    objectToAttach: SceneObject & MoveableObject,
    parent: SceneObject & MoveableObject,
    positionPreference: DefaultAttachPosition,
): Vector2d {
    switch (positionPreference) {
        case DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT:
        case DefaultAttachPosition.ANYWHERE:
            // For objects without a preference, keep them where they are.
            return makeRelative(scene, objectToAttach, parent.id);
        case DefaultAttachPosition.CENTER:
            return { x: 0, y: 0 };
        case DefaultAttachPosition.TOP:
            return getAttachTopPoint(scene, objectToAttach, parent);
        case DefaultAttachPosition.BOTTOM_RIGHT:
            return getAttachBottomRightPoint(scene, objectToAttach, parent);
    }
}

function getAttachTopPoint(scene: Scene, objectToAttach: SceneObject, parent: SceneObject): Vector2d {
    // points relative to each object's origin where the attachment should happen.
    let objectAttatchmentPoint = { x: 0, y: 0 };
    let parentAttachmentPoint = { x: 0, y: 0 };
    if (isResizable(objectToAttach)) {
        objectAttatchmentPoint = { x: 0, y: -objectToAttach.height / 2 };
    } else if (isRadiusObject(objectToAttach)) {
        objectAttatchmentPoint = { x: 0, y: -objectToAttach.radius };
    }

    // If there are already-attached and still-pinned TOP objects, assume they're all
    // in their default position and add this new one above them.
    let addedHeight = 0;
    for (const attachment of getDirectPositionDescendants(scene, parent)) {
        if (!attachment.pinned) {
            continue;
        }
        if (getDefaultAttachmentSettings(attachment).location == DefaultAttachPosition.TOP) {
            if (isResizable(attachment)) {
                addedHeight += attachment.height;
            } else if (isRadiusObject(attachment)) {
                addedHeight += attachment.radius * 2;
            }
        }
    }

    if (isResizable(parent)) {
        parentAttachmentPoint = { x: 0, y: parent.height / 2 + addedHeight };
    } else if (isRadiusObject(parent)) {
        parentAttachmentPoint = { x: 0, y: parent.radius + addedHeight };
    }
    return {
        x: parentAttachmentPoint.x - objectAttatchmentPoint.x,
        y: parentAttachmentPoint.y - objectAttatchmentPoint.y,
    };
}

function getAttachBottomRightPoint(scene: Scene, objectToAttach: SceneObject, parent: SceneObject): Vector2d {
    // points relative to each object's origin where the attachment should happen.
    let objectAttatchmentPoint = { x: 0, y: 0 };
    let parentAttachmentPoint = { x: 0, y: 0 };
    if (isResizable(objectToAttach)) {
        objectAttatchmentPoint = { x: -objectToAttach.width / 2, y: objectToAttach.height / 2 };
    } else if (isRadiusObject(objectToAttach)) {
        const offset = Math.sqrt(objectToAttach.radius ** 2 / 2);
        objectAttatchmentPoint = { x: -offset, y: offset };
    }

    // If there are already-attached and still-pinned BOTTOM_RIGHT objects, assume
    // they're all in their default position and add this new one to the right of them.
    let addedOffset = 0;
    for (const attachment of getDirectPositionDescendants(scene, parent)) {
        if (!attachment.pinned) {
            continue;
        }
        if (getDefaultAttachmentSettings(attachment).location == DefaultAttachPosition.BOTTOM_RIGHT) {
            if (isResizable(attachment)) {
                addedOffset += attachment.width;
            } else if (isRadiusObject(attachment)) {
                addedOffset += attachment.radius * 2;
            }
        }
    }

    if (isResizable(parent)) {
        const overlap = 0.9;
        parentAttachmentPoint = {
            x: (parent.width / 2) * (1 - overlap) + addedOffset,
            y: -(parent.height / 2) * (1 - overlap),
        };
    } else if (isRadiusObject(parent)) {
        const overlap = 0.4;
        const offset = Math.sqrt((parent.radius * (1 - overlap)) ** 2 / 2);
        parentAttachmentPoint = { x: offset + addedOffset, y: -offset };
    }

    return {
        x: parentAttachmentPoint.x - objectAttatchmentPoint.x,
        y: parentAttachmentPoint.y - objectAttatchmentPoint.y,
    };
}

export function unlinkAction(connectionType: ConnectionType, objectIds: readonly number[]): SceneAction {
    switch (connectionType) {
        case ConnectionType.POSITION:
            return {
                type: 'transform',
                ids: objectIds,
                transformFn: unlinkPosition,
            };
        case ConnectionType.ROTATION:
            return {
                type: 'transform',
                ids: objectIds,
                transformFn: unlinkRotation,
            };
    }
}

export function unlinkPosition(object: SceneObject, scene: Scene): SceneObject {
    if (!isMoveable(object)) {
        return object;
    }
    const absolutePos = getAbsolutePosition(scene, object);
    return {
        ...omit(object, 'positionParentId'),
        // Always unpin objects upon detaching them
        pinned: false,
        ...absolutePos,
    };
}

export function unlinkRotation(object: SceneObject, scene: Scene): SceneObject {
    if (!isRotateable(object)) {
        return object;
    }
    return {
        ...omit(object, 'facingId'),
        rotation: isMoveable(object) ? getAbsoluteRotation(scene, object) : 0,
    };
}
