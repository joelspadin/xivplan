import { EnemyObject, Scene, SceneObject, SceneStep, isEnemy } from '../scene';

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

    return object;
}

function upgradeEnemy(object: EnemyObject): SceneObject {
    // enemy was changed from { rotation?: number }
    // to { rotation: number, directional: boolean }
    return { ...object, rotation: object.rotation ?? 0, omniDirection: object.rotation === undefined };
}
