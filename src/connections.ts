import { getAbsolutePosition, getRelativeAttachmentPoint } from './coord';
import { ConnectionType } from './EditModeContext';
import {
    DefaultAttachPosition,
    getDefaultAttachmentPreference,
    isMoveable,
    isRotateable,
    MoveableObject,
    RotateableObject,
    Scene,
    SceneObject,
    SceneStep,
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
            return getAllowedRotationParentIds(
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
            if (isMoveable(obj) && obj.parentId !== undefined && selectedAndChildren.has(obj.parentId)) {
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
 * This only excludes the selection -- it's OK to face an attached object.
 */
export function getAllowedRotationParentIds(step: SceneStep, objectsToConnect: readonly SceneObject[]): number[] {
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
        let parentId = obj.parentId;
        while (parentId !== undefined) {
            if (objectIds.has(parentId)) {
                return false;
            }
            const parent = getObjectById(scene, parentId);
            parentId = isMoveable(parent) ? parent.parentId : undefined;
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
        attachPositionCounts[getDefaultAttachmentPreference(obj)]++;
    });
    return {
        type: 'update',
        value: objectsToConnect.map((obj) => {
            const absolutePos = getAbsolutePosition(scene, obj);
            // Markers and status effects go to the new default position. Anything else just stays where it is.
            let attachmentPreference = getDefaultAttachmentPreference(obj);
            // If more than one object would get moved to the same spot, just leave them where they are to avoid full overlaps
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
                parentId: newParent.id,
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
