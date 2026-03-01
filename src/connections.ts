import { Vector2d } from 'konva/lib/types';
import { getAbsolutePosition, isWithinBox, isWithinRadius, makeRelative } from './coord';
import { ConnectionType } from './EditModeContext';
import { LayerName } from './render/layers';
import { getLayerName } from './render/ObjectRegistry';
import {
    isIcon,
    isMoveable,
    isRadiusObject,
    isResizable,
    isRotateable,
    MoveableObject,
    ObjectType,
    RotateableObject,
    Scene,
    SceneObject,
    SceneStep,
    UnknownObject,
} from './scene';
import { getDirectPositionDescendants, getObjectById, SceneAction, useScene } from './SceneProvider';
import { useConnectionSelection } from './useConnectionSelection';

/**
 * Returns the ConnectionType-appropriate functions to get the current connection ID for a single object,
 * and the allowed connection IDs for a selection of objects.
 */
export function getConnectionIdFuncs(
    connectionType: ConnectionType,
): [
    (obj: SceneObject) => number | undefined,
    (step: SceneStep, objectsToConnect: readonly SceneObject[]) => ReadonlySet<number>,
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
    const { step } = useScene();
    const [connectionSelection] = useConnectionSelection();
    const objectIdsToConnect = connectionSelection.objectIdsToConnect;

    switch (connectionSelection.connectionType) {
        case ConnectionType.POSITION:
            return getAllowedPositionParentIds(
                step,
                step.objects.filter((obj) => objectIdsToConnect.has(obj.id)),
            );
        case ConnectionType.ROTATION: {
            return getAllowedRotationConnectionIds(
                step,
                step.objects.filter((obj) => objectIdsToConnect.has(obj.id)),
            );
        }
    }
}

/**
 * @returns a list of object IDs in the current step that the given selection of objects is allowed to have as
 * position parent. This excludes the selection plus any of its position descendants.
 */
export function getAllowedPositionParentIds(
    step: SceneStep,
    objectsToConnect: readonly SceneObject[],
): ReadonlySet<number> {
    const selectedAndChildren = new Set<number>(objectsToConnect.map((obj) => obj.id));
    let addedObjects = objectsToConnect.length;
    while (addedObjects > 0) {
        addedObjects = 0;
        step.objects.forEach((obj) => {
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
    return new Set(step.objects.filter(isAllowed).map((obj) => obj.id));
}

/**
 * @returns a list of object IDs in the current step that the given selection of objects is allowed to face.
 * This only excludes the selection -- it's OK to face an attached object or objects that face the selection.
 */
export function getAllowedRotationConnectionIds(
    step: SceneStep,
    objectsToConnect: readonly SceneObject[],
): ReadonlySet<number> {
    const selectedIds = new Set<number>(objectsToConnect.map((obj) => obj.id));

    const isAllowed = (obj: SceneObject) => isMoveable(obj) && !selectedIds.has(obj.id);
    return new Set(step.objects.filter(isAllowed).map((obj) => obj.id));
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
 * Returns a function that yields a SceneAction to update the given object as the chosen connected ID,
 * determined by the values in the ConnectionSelectionContext
 */
export function useUpdateConnectedIdsAction(): (newParent: SceneObject & MoveableObject) => SceneAction {
    const { scene } = useScene();
    const [{ objectIdsToConnect, connectionType }] = useConnectionSelection();

    switch (connectionType) {
        case ConnectionType.POSITION: {
            return (newParent: SceneObject & MoveableObject) => {
                return createUpdatePositionParentIdsAction(scene, objectIdsToConnect, newParent);
            };
        }
        case ConnectionType.ROTATION: {
            return (newParent: SceneObject & MoveableObject) => {
                return createUpdateRotationParentIdsAction(scene, objectIdsToConnect, newParent);
            };
        }
    }
}

function createUpdateRotationParentIdsAction(
    scene: Scene,
    objectIdsToConnect: ReadonlySet<number>,
    newParent: SceneObject & MoveableObject,
): SceneAction {
    const objectsToConnect: (SceneObject & RotateableObject)[] = [];
    objectIdsToConnect.forEach((id) => {
        const object = getObjectById(scene, id);
        if (isRotateable(object)) {
            objectsToConnect.push(object);
        }
    });
    return {
        type: 'update',
        value: objectsToConnect.map((obj) => {
            // always face the newly-connected target object by default.
            return { ...obj, facingId: newParent.id, rotation: 0 };
        }),
    };
}

function createUpdatePositionParentIdsAction(
    scene: Scene,
    objectIdsToConnect: ReadonlySet<number>,
    newParent: SceneObject & MoveableObject,
): SceneAction {
    const objectsToConnect: (SceneObject & MoveableObject)[] = [];
    objectIdsToConnect.forEach((id) => {
        const object = getObjectById(scene, id);
        if (isMoveable(object)) {
            objectsToConnect.push(object);
        }
    });

    const attachPositionCounts: Record<DefaultAttachPosition, number> = {
        [DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT]: 0,
        [DefaultAttachPosition.ANYWHERE]: 0,
        [DefaultAttachPosition.CENTER]: 0,
        [DefaultAttachPosition.TOP]: 0,
        [DefaultAttachPosition.BOTTOM_RIGHT]: 0,
    };
    objectsToConnect.forEach((obj) => {
        attachPositionCounts[getDefaultAttachmentSettings(obj).location]++;
    });
    return {
        type: 'update',
        value: objectsToConnect.map((obj) => {
            const attachmentSettings = getDefaultAttachmentSettings(obj);
            // If more than one object would get moved to the same spot, just leave them where they are to avoid full overlaps
            // and ambiguous orderings. Center-attachments are fine to overlap.
            // TODO: figure out what the expected behavior is for top & bottom-right. is arbitrary ordering fine?
            if (
                attachPositionCounts[attachmentSettings.location] > 1 &&
                attachmentSettings.location != DefaultAttachPosition.CENTER
            ) {
                attachmentSettings.location = DefaultAttachPosition.ANYWHERE;
            }
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
                pinned:
                    attachmentSettings.location == DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT ||
                    attachmentSettings.location == DefaultAttachPosition.ANYWHERE
                        ? obj.pinned
                        : attachmentSettings.pinByDefault,
            };
        }),
    };
}

export enum DefaultAttachPosition {
    DONT_ATTACH_BY_DEFAULT = 0,
    ANYWHERE,
    CENTER,
    TOP,
    BOTTOM_RIGHT,
}

/** @returns Where the given object 'prefers' to be attached to a positional parent. */
export function getDefaultAttachmentSettings(object: UnknownObject): {
    location: DefaultAttachPosition;
    pinByDefault: boolean;
} {
    switch (object.type) {
        case ObjectType.Arc:
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

export enum AttachmentDropTarget {
    NONE = 0,
    SELF,
    PARENT,
}

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
