import { getAbsolutePosition, getRelativeAttachmentPoint } from './coord';
import {
    DefaultAttachPosition,
    getDefaultAttachmentPreference,
    isMoveable,
    MoveableObject,
    Scene,
    SceneObject,
    SceneStep,
} from './scene';
import { getObjectById, SceneAction, useScene } from './SceneProvider';
import { useConnectionSelection } from './useConnectionSelection';

export function useAllowedParentIds(): number[] {
    const { step } = useScene();
    const [connectionSelection] = useConnectionSelection();
    const objectIdsToConnect = new Set(connectionSelection.objectIdsToConnect);

    return getAllowedParentIds(
        step,
        step.objects.filter((obj) => objectIdsToConnect.has(obj.id)),
    );
}

export function getAllowedParentIds(step: SceneStep, objectsToConnect: readonly SceneObject[]): number[] {
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

export function useUpdateParentIdsAction(): (newParent: SceneObject & MoveableObject) => SceneAction {
    const { scene } = useScene();
    const [connectionSelection] = useConnectionSelection();
    const objectsToConnect: (SceneObject & MoveableObject)[] = [];
    connectionSelection.objectIdsToConnect.forEach((id) => {
        const object = getObjectById(scene, id);
        if (isMoveable(object)) {
            objectsToConnect.push(object);
        }
    });
    return (newParent: SceneObject & MoveableObject) => createUpdateParentIdsAction(scene, objectsToConnect, newParent);
}

function createUpdateParentIdsAction(
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
