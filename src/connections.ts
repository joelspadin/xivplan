import { Vector2d } from 'konva/lib/types';
import { getAbsolutePosition, getRelativeAttachmentPoint, isWithinBox, isWithinRadius } from './coord';
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
import { getObjectById, SceneAction, useScene } from './SceneProvider';
import { useConnectionSelection } from './useConnectionSelection';

export function useAllowedConnectionIds(): number[] {
    const { step } = useScene();
    const [connectionSelection] = useConnectionSelection();
    const objectIdsToConnect = new Set(connectionSelection.objectIdsToConnect);

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

export function getAllowedPositionParentIds(step: SceneStep, objectsToConnect: readonly SceneObject[]): number[] {
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

    return step.objects
        .filter(isMoveable)
        .map((obj) => obj.id)
        .filter((id) => !selectedAndChildren.has(id));
}

/**
 * Returns a list of object IDs that the given selection of objects is allowed to face.
 * This only excludes the selection -- it's OK to face an attached object or objects that face the selection.
 */
export function getAllowedRotationConnectionIds(step: SceneStep, objectsToConnect: readonly SceneObject[]): number[] {
    const selectedIds = new Set<number>(objectsToConnect.map((obj) => obj.id));

    return step.objects
        .filter(isMoveable)
        .map((obj) => obj.id)
        .filter((id) => !selectedIds.has(id));
}

/** Returns a filtered list of objects that has any objects removes that are positionally attached to another object in the list. */
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
            positionParentId = isMoveable(parent) ? parent.positionParentId : undefined;
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
            const objectsToConnect: (SceneObject & MoveableObject)[] = [];
            objectIdsToConnect.forEach((id) => {
                const object = getObjectById(scene, id);
                if (isMoveable(object)) {
                    objectsToConnect.push(object);
                }
            });

            return (newParent: SceneObject & MoveableObject) =>
                createUpdatePositionParentIdsAction(scene, objectsToConnect, newParent);
        }
        case ConnectionType.ROTATION: {
            const objectsToConnect: (SceneObject & RotateableObject)[] = [];
            objectIdsToConnect.forEach((id) => {
                const object = getObjectById(scene, id);
                if (isRotateable(object)) {
                    objectsToConnect.push(object);
                }
            });
            return (newParent: SceneObject & MoveableObject) =>
                createUpdateRotationParentIdsAction(scene, objectsToConnect, newParent);
        }
    }
}

function createUpdateRotationParentIdsAction(
    scene: Scene,
    objectsToConnect: readonly (SceneObject & RotateableObject)[],
    newParent: SceneObject & MoveableObject,
): SceneAction {
    return {
        type: 'update',
        value: objectsToConnect.map((obj) => {
            // always face the newly-linked target object by default.
            // (the rendering logic will ensure '0' is facing newParent)
            return { ...obj, facingId: newParent.id, rotation: 0 };
        }),
    };
}

function createUpdatePositionParentIdsAction(
    scene: Scene,
    objectsToConnect: readonly (SceneObject & MoveableObject)[],
    newParent: SceneObject & MoveableObject,
): SceneAction {
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
            const absolutePos = getAbsolutePosition(scene, obj);
            // Markers and status effects go to the new default position. Anything else just stays where it is.
            let attachmentPreference = getDefaultAttachmentSettings(obj).location;
            // If more than one object would get moved to the same spot, just leave them where they are to avoid full overlaps
            // and ambiguous orderings.
            if (attachPositionCounts[attachmentPreference] > 1) {
                attachmentPreference = DefaultAttachPosition.ANYWHERE;
            }
            const newRelativePos = getRelativeAttachmentPoint(
                scene,
                { ...obj, ...absolutePos },
                newParent,
                attachmentPreference,
            );
            return {
                ...obj,
                positionParentId: newParent.id,
                ...newRelativePos,
                // Pin objects that got moved to a default position
                pinned:
                    attachmentPreference == DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT ||
                    attachmentPreference == DefaultAttachPosition.ANYWHERE
                        ? obj.pinned
                        : true,
            };
        }),
    };
}

export enum DefaultAttachPosition {
    DONT_ATTACH_BY_DEFAULT = 'dont_attach_by_default',
    ANYWHERE = 'attach_anywhere',
    CENTER = 'attach_centered',
    TOP = 'attach_at_top',
    BOTTOM_RIGHT = 'attach_at_bottom_right',
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
    NONE = 'none',
    SELF = 'self',
    PARENT = 'parent',
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
export function getObjectToAttachToAt(s: Scene, step: SceneStep, p: Vector2d): SceneObject | undefined {
    let matchedObject: SceneObject | undefined = undefined;
    for (const layer of Object.values(LayerName)) {
        step.objects.forEach((o) => {
            if (getLayerName(o) !== layer) {
                return;
            }
            const dropTarget = isValidAttachmentDropTarget(o);
            if (dropTarget == AttachmentDropTarget.NONE) {
                return;
            }
            // For now, only objects with full coverage within their radius/box will pass the above check.
            if (
                (isRadiusObject(o) && isWithinRadius({ ...o, ...getAbsolutePosition(s, o) }, p)) ||
                (isResizable(o) && isWithinBox({ ...o, ...getAbsolutePosition(s, o) }, p))
            ) {
                if (dropTarget == AttachmentDropTarget.SELF) {
                    matchedObject = o;
                } else if (dropTarget == AttachmentDropTarget.PARENT) {
                    // If the object is an attachment itself, and the parent does allow attaching, attach to that instead.
                    if (isMoveable(o) && o.positionParentId !== undefined) {
                        const parentObject = getObjectById(s, o.positionParentId);
                        if (
                            isMoveable(parentObject) &&
                            isValidAttachmentDropTarget(parentObject) == AttachmentDropTarget.SELF
                        ) {
                            matchedObject = parentObject;
                        }
                    }
                }
            }
        });
    }
    return matchedObject;
}
