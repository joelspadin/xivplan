import { Vector2d } from 'konva/lib/types';
import { omitInterconnectedObjects } from './connections';
import { getAbsolutePosition, getAbsoluteRotation } from './coord';
import {
    isMoveable,
    isRotateable,
    isTether,
    MoveableObject,
    RotateableObject,
    Scene,
    SceneObject,
    Tether,
    UnknownObject,
} from './scene';
import { isNotNull, omit } from './util';
import { VEC_ZERO, vecAdd, vecSub } from './vector';

export function getGroupCenter(scene: Readonly<Scene>, objects: readonly MoveableObject[]): Vector2d {
    const moveable = objects.filter(isMoveable).map((obj) => getAbsolutePosition(scene, obj));
    if (!moveable.length) {
        return { x: 0, y: 0 };
    }

    const x = moveable.reduce((result, obj) => result + obj.x, 0) / moveable.length;
    const y = moveable.reduce((result, obj) => result + obj.y, 0) / moveable.length;

    return { x, y };
}

function isTargetCopied(originalTargets: readonly UnknownObject[], id: number) {
    return originalTargets.some((obj) => obj.id === id);
}

function getOffset(scene: Readonly<Scene>, objects: readonly SceneObject[], newCenter?: Vector2d) {
    if (newCenter) {
        // Only count the centers of parent objects within the set to calculate the offset.
        const currentCenter = getGroupCenter(scene, omitInterconnectedObjects(scene, objects.filter(isMoveable)));
        return vecSub(newCenter, currentCenter);
    }

    return VEC_ZERO;
}

function isCopyable(object: Readonly<SceneObject>, objects: readonly SceneObject[]) {
    if (isMoveable(object)) {
        return true;
    }

    if (isTether(object)) {
        return isTargetCopied(objects, object.startId) || isTargetCopied(objects, object.endId);
    }

    return false;
}

function copyObject(
    scene: Readonly<Scene>,
    object: Readonly<MoveableObject & UnknownObject>,
    offset: Vector2d,
    newIdsForCopiedObjects: Record<number, number>,
): SceneObject {
    let newObject: SceneObject | (SceneObject & RotateableObject) = { ...object };
    if (object.positionParentId !== undefined) {
        // If the parent also gets copied, do not adjust the already-relative position.
        // Otherwise make a detached copy.
        if (newIdsForCopiedObjects[object.positionParentId] !== undefined) {
            newObject = { ...newObject, positionParentId: newIdsForCopiedObjects[object.positionParentId] };
        } else {
            newObject = { ...omit(object, 'positionParentId'), ...vecAdd(getAbsolutePosition(scene, object), offset) };
        }
    } else {
        newObject = { ...newObject, ...vecAdd(object, offset) };
    }

    if (isRotateable(newObject) && newObject.facingId !== undefined) {
        // If the facing target also gets copied, face the copy. Otherwise keep the rotation.
        if (newIdsForCopiedObjects[newObject.facingId] !== undefined) {
            newObject = { ...newObject, facingId: newIdsForCopiedObjects[newObject.facingId] };
        } else {
            // TODO: if copied onto the same step, maybe keep facing the same target instead?
            newObject = {
                ...omit(newObject, 'facingId'),
                rotation: isRotateable(object) ? getAbsoluteRotation(scene, object) : 0,
            };
        }
    }

    return newObject;
}

function copyTether(
    scene: Readonly<Scene>,
    tether: Readonly<Tether>,
    originalTargets: readonly UnknownObject[],
    newIdsForCopiedObjects: Record<number, number>,
): SceneObject | null {
    if (!newIdsForCopiedObjects[tether.startId] && !newIdsForCopiedObjects[tether.endId]) {
        return null;
    }

    // TODO: also don't copy if the not-copied end point is not on the same step as
    // where the objects are pasted.
    const newTether = {
        ...tether,
        startId: newIdsForCopiedObjects[tether.startId] || tether.startId,
        endId: newIdsForCopiedObjects[tether.endId] || tether.endId,
    };

    return { ...newTether };
}

export function copyObjects(
    scene: Readonly<Scene>,
    objects: readonly SceneObject[],
    newCenter?: Vector2d,
): { objects: SceneObject[]; nextId: number } {
    let nextId = scene.nextId;
    const copyable = objects.slice().filter((o) => isCopyable(o, objects));

    const idMap: Record<number, number> = {};

    const offset = getOffset(scene, copyable, newCenter);

    return {
        objects: objects
            .map((obj) => {
                // Assign new IDs first so that ID references can be updated
                idMap[obj.id] = nextId++;
                return { ...obj, id: idMap[obj.id] } as SceneObject;
            })
            .map((obj) => {
                if (isMoveable(obj)) {
                    return copyObject(scene, obj, offset, idMap);
                }

                if (isTether(obj)) {
                    return copyTether(scene, obj, copyable, idMap);
                }

                return null;
            })
            .filter(isNotNull),
        nextId,
    };
}
