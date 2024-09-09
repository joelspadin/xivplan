import { Vector2d } from 'konva/lib/types';
import { DEFAULT_ENEMY_OPACITY } from '../render/SceneTheme';
import {
    DrawObject,
    EnemyObject,
    ExaflareZone,
    ImageObject,
    Scene,
    SceneObject,
    SceneStep,
    isDrawObject,
    isEnemy,
    isExaflareZone,
    isImageObject,
} from '../scene';

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

    if (isImageObject(object)) {
        object = upgradeImageObject(object);
    }

    if (isExaflareZone(object)) {
        object = upgradeExaflareZone(object);
    }

    return object;
}

function upgradeEnemy<T extends EnemyObject>(object: T): T {
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

function upgradeDrawObject<T extends DrawObject>(object: T): T {
    // draw object was changed from { points: Vector2d[] }
    // to { points: number[] }

    if (typeof object.points[0] === 'object') {
        const v1 = object as unknown as DrawObjectV1;

        const points: number[] = [];
        for (const point of v1.points) {
            points.push(point.x, point.y);
        }

        return { ...object, points };
    }

    return object;
}

function upgradeImageObject<T extends ImageObject>(object: T): T {
    // Replace status icons from XIVAPI with ones from the beta API that support CORS.
    const image = object.image.replace(/https:\/\/xivapi.com\/i\/(\w+)\/(\w+)\.png/, (match, folder, name) => {
        return `https://beta.xivapi.com/api/1/asset/ui/icon/${folder}/${name}.tex?format=png`;
    });

    return { ...object, image };
}

const LEGACY_SPACING = 60;

function upgradeExaflareZone(object: ExaflareZone): ExaflareZone {
    return { ...object, spacing: object.spacing ?? LEGACY_SPACING };
}
