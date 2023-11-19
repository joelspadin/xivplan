import { Vector2d } from 'konva/lib/types';
import { DEFAULT_ENEMY_OPACITY } from '../render/SceneTheme';
import { DrawObject, EnemyObject, Scene, SceneObject, SceneStep, isDrawObject, isEnemy } from '../scene';

export function upgradeScene(scene: Scene): Scene {
    return {
        ...scene,
        steps: scene.steps.map(upgradeStep),
    };
}

function upgradeStep(step: SceneStep): SceneStep {
    return {
        ...step,
        objects: step.objects.map(upgradeObject),
    };
}

function upgradeObject(object: SceneObject): SceneObject {
    if (isEnemy(object)) {
        object = upgradeEnemy(object);
    }

    if (isDrawObject(object)) {
        object = upgradeDrawObject(object);
    }

    return object;
}

function upgradeEnemy(object: EnemyObject): SceneObject {
    // enemy was changed from { rotation?: number }
    // to { rotation: number, directional: boolean, opacity: number }
    return {
        ...object,
        rotation: object.rotation ?? 0,
        omniDirection: object.omniDirection ?? object.rotation === undefined,
        opacity: object.opacity ?? DEFAULT_ENEMY_OPACITY,
    };
}

interface DrawObjectV1 {
    points: readonly Vector2d[];
}

function upgradeDrawObject(object: DrawObject): SceneObject {
    // draw object was changed from { points: Vector2d[] }
    // to { points: number[] }

    if (typeof object.points[0] === 'object') {
        const v1 = object as unknown as DrawObjectV1;

        const points: number[] = [];
        for (const point of v1.points) {
            points.push(point.x, point.y);
        }

        return { ...object, points } as DrawObject;
    }

    return object;
}
