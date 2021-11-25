import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { Dispatch, SetStateAction } from 'react';
import { getSceneCoord } from './coord';
import {
    isMoveable,
    isTether,
    MoveableObject,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    Tether,
    UnknownObject,
} from './scene';
import { SceneAction } from './SceneProvider';
import { SceneSelection, selectNewObjects } from './SelectionProvider';
import { vecAdd, vecSub, VEC_ZERO } from './vector';

export function getGroupCenter(objects: readonly MoveableObject[]): Vector2d {
    const moveable = objects.filter(isMoveable);
    if (!moveable.length) {
        return { x: 0, y: 0 };
    }

    const x = moveable.reduce((result, obj) => result + obj.x, 0) / moveable.length;
    const y = moveable.reduce((result, obj) => result + obj.y, 0) / moveable.length;

    return { x, y };
}

function copyMoveableObjects(
    stage: Stage,
    scene: Scene,
    objects: readonly (MoveableObject & SceneObject)[],
    centerOnMouse = true,
): SceneObjectWithoutId[] {
    let offset = VEC_ZERO;

    if (centerOnMouse) {
        const center = getGroupCenter(objects);
        const mousePos = getSceneCoord(scene, stage.getRelativePointerPosition());

        offset = vecSub(mousePos, center);
    }

    return objects.map((obj) => {
        const pos = vecAdd(obj, offset);
        return { ...obj, ...pos, id: undefined };
    });
}

function isTargetCopied(originalTargets: readonly UnknownObject[], id: number) {
    return originalTargets.some((obj) => obj.id === id);
}

function retargetTether(scene: Scene, originalTargets: readonly UnknownObject[], id: number) {
    const targetIndex = originalTargets.findIndex((obj) => obj.id === id);
    if (targetIndex >= 0) {
        return scene.nextId + targetIndex;
    }
    return id;
}

function copyTethers(
    scene: Scene,
    tethers: readonly Tether[],
    originalTargets: readonly UnknownObject[],
): SceneObjectWithoutId[] {
    return tethers
        .filter((t) => {
            return isTargetCopied(originalTargets, t.startId) || isTargetCopied(originalTargets, t.endId);
        })
        .map((t) => {
            return {
                ...t,
                startId: retargetTether(scene, originalTargets, t.startId),
                endId: retargetTether(scene, originalTargets, t.endId),
                id: undefined,
            };
        });
}

export function pasteObjects(
    stage: Stage,
    scene: Scene,
    dispatch: Dispatch<SceneAction>,
    setSelection: Dispatch<SetStateAction<SceneSelection>>,
    objects: readonly SceneObject[],
    centerOnMouse = true,
): void {
    const newObjects: SceneObjectWithoutId[] = [];
    const moveable = objects.filter(isMoveable);
    const tethers = objects.filter(isTether);

    if (moveable.length) {
        newObjects.push(...copyMoveableObjects(stage, scene, moveable, centerOnMouse));
    }

    if (tethers.length) {
        newObjects.push(...copyTethers(scene, tethers, moveable));
    }

    if (newObjects.length) {
        dispatch({ type: 'add', object: newObjects });
        setSelection(selectNewObjects(scene, newObjects.length));
    }
}
