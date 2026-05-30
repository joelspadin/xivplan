import type { Vector2d } from 'konva/lib/types';
import { getAbsoluteRotation, getBaseFacingRotation, rotateCoord } from '../coord';
import {
    type ArrowObject,
    type DrawObject,
    type EnemyObject,
    EnemyRingStyle,
    type ExaflareZone,
    type ImageObject,
    type MarkerObject,
    type MoveableObject,
    type PartyObject,
    type PolygonOrientation,
    type PolygonZone,
    type RotateableObject,
    type Scene,
    type SceneObject,
    type SceneStep,
    type StackZone,
    type TextObject,
    type TextStyle,
    isArrow,
    isDrawObject,
    isEnemy,
    isExaflareZone,
    isImageObject,
    isMarker,
    isParty,
    isPolygonZone,
    isStackZone,
    isText,
} from '../scene';
import { DEFAULT_ENEMY_OPACITY, DEFAULT_IMAGE_OPACITY, DEFAULT_MARKER_OPACITY, DEFAULT_PARTY_OPACITY } from '../theme';
import { omit } from '../util';

export function upgradeScene(scene: Scene): Scene {
    return {
        ...scene,
        steps: scene.steps.map((step) => upgradeStep(scene, step)),
    };
}

function upgradeStep(scene: Scene, step: SceneStep): SceneStep {
    return {
        ...step,
        objects: step.objects.map((obj) => upgradeObject(scene, obj)),
    };
}

function upgradeObject(scene: Scene, object: SceneObject): SceneObject {
    if (isEnemy(object)) {
        object = upgradeEnemy(object);
    }

    if (isParty(object)) {
        object = upgradeParty(object);
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

    if (isMarker(object)) {
        object = upgradeMarker(object);
    }

    if (isText(object)) {
        object = upgradeText(object);
    }

    if (isPolygonZone(object)) {
        object = upgradePolygon(object);
    }

    if (isStackZone(object)) {
        object = upgradeStackZone(object);
    }

    if (isArrow(object)) {
        object = upgradeArrow(scene, object);
    }

    return object;
}

// EnemyObject was changed from { rotation?: number }
// to { rotation: number, omniDirection: boolean, opacity: number }, then
// to { rotation: number, ring: EnemyRingStyle, opacity: number }
type LegacyEnemyObject = Omit<EnemyObject, 'opacity' | 'rotation' | 'ring'> & {
    opacity?: number;
    rotation?: number;
    omniDirection?: boolean;
    ring?: EnemyRingStyle;
};

function getRingStyle<T extends LegacyEnemyObject>(object: T): EnemyRingStyle {
    if (object.rotation === undefined) {
        return EnemyRingStyle.NoDirection;
    }

    if ('omniDirection' in object && typeof object.omniDirection === 'boolean') {
        return object.omniDirection ? EnemyRingStyle.NoDirection : EnemyRingStyle.Directional;
    }

    return EnemyRingStyle.Directional;
}

function upgradeEnemy(object: LegacyEnemyObject): EnemyObject {
    return {
        ...object,
        rotation: object.rotation ?? 0,
        ring: object.ring ?? getRingStyle(object),
        opacity: object.opacity ?? DEFAULT_ENEMY_OPACITY,
    };
}

// DrawObject was changed from { points: Vector2d[] }
// to { points: number[] }
type DrawObjectV1 = Omit<DrawObject, 'points'> & {
    points: readonly Vector2d[];
};

function isDrawObjectV1(object: DrawObject | DrawObjectV1): object is DrawObjectV1 {
    return object.points.length > 0 && typeof object.points[0] === 'object';
}

function upgradeDrawObject(object: DrawObject | DrawObjectV1): DrawObject {
    if (isDrawObjectV1(object)) {
        const points: number[] = [];
        for (const point of object.points) {
            points.push(point.x, point.y);
        }

        return { ...object, points };
    }

    return object;
}

const DEPRECATED_IMAGE_PATTERNS = [
    /https:\/\/xivapi\.com\/i\/(\w+)\/(\w+)\.png/,
    /https:\/\/beta\.xivapi\.com\/api\/1\/.*\/(\w+)\/(\w+)\.tex\?format=png/,
];

// opacity property was added to ImageObject.
// Status icons from legacy XIVAPI did not support CORS and would not render.
// The beta XIVAPI is now broken and replaced by V2.
function upgradeImageObject<T extends ImageObject>(object: T): T {
    // Replace status icons from the XIVAPI V1 or beta APIs with ones from the V2 API.
    let image = object.image;

    for (const pattern of DEPRECATED_IMAGE_PATTERNS) {
        image = image.replace(pattern, (match, folder, name) => {
            return `https://v2.xivapi.com/api/asset/ui/icon/${folder}/${name}.tex?format=png`;
        });
    }

    return {
        opacity: DEFAULT_IMAGE_OPACITY,
        ...object,
        image,
    };
}

// spacing property was added to ExaflareZone
type LegacyExaflareZone = Omit<ExaflareZone, 'spacing'> & {
    spacing?: number;
};

function upgradeExaflareZone(object: LegacyExaflareZone): ExaflareZone {
    return {
        spacing: 60,
        ...object,
    };
}

// opacity property was added to MarkerObject
type LegacyMarkerObject = Omit<MarkerObject, 'opacity'> & {
    opacity?: number;
};

function upgradeMarker(object: LegacyMarkerObject): MarkerObject {
    return {
        opacity: DEFAULT_MARKER_OPACITY,
        ...object,
    };
}

// opacity property was added to PartyObject
type LegacyPartyObject = Omit<PartyObject, 'opacity'> & {
    opacity?: number;
};

function upgradeParty(object: LegacyPartyObject): PartyObject {
    return {
        opacity: DEFAULT_PARTY_OPACITY,
        ...object,
    };
}

// stroke and style properties were added to TextObject
type LegacyTextObject = Omit<TextObject, 'stroke' | 'style'> & {
    stroke?: string;
    style?: TextStyle;
};

function upgradeText(object: LegacyTextObject): TextObject {
    return {
        stroke: '#40352c',
        style: 'outline',
        ...object,
    };
}

// orient property was added to PolygonZone
type LegacyPolygonZone = Omit<PolygonZone, 'orient'> & {
    orient?: PolygonOrientation;
};

function upgradePolygon(object: LegacyPolygonZone): PolygonZone {
    return {
        orient: 'point',
        ...object,
    };
}

// StackZone was split off from CircleZone
// count property was added
type LegacyStackZone = Omit<StackZone, 'count'> & {
    count?: number;
};

function upgradeStackZone(object: LegacyStackZone): StackZone {
    return {
        count: 1,
        ...object,
    };
}

// Arrow used to be a fancy ZoneRectangle, but is now a fancy ZoneLine
type LegacyArrow = Omit<ArrowObject, 'length'> & {
    height?: number;
};

function upgradeArrow(scene: Scene, object: LegacyArrow): ArrowObject {
    if (object.height === undefined) {
        return object as ArrowObject;
    }
    const absoluteRotation = getAbsoluteRotation(scene, object);
    // The old arrow was scaled from the default-length arrow including "extent" measures that used
    // the static stroke width, resulting in more deviation from the configured length the more it
    // was different from the default length. However since we're changing how arrows render anyway,
    // keeping the coordinates and length value intact is more likely to yield the desired (or
    // most-expected) outcome for users.
    // const length = object.height + ((object.height - DEFAULT_ARROW_LENGTH) / DEFAULT_ARROW_LENGTH) * ARROW_STROKE_WIDTH;
    const length = object.height;
    const offset = rotateCoord({ x: 0, y: -length / 2 }, absoluteRotation);

    return {
        // Omit the unused height to avoid doubled-up size property controls
        ...omit(object, 'height'),

        length,
        x: object.x + offset.x,
        y: object.y + offset.y,
        rotation: updateRotation(scene, object, offset),
    };
}

/**
 * Calculate the new rotation an object should have to retain the same absolute rotation, after its origin
 * has been moved by the given offset.
 */
function updateRotation(scene: Scene, object: MoveableObject & RotateableObject, offset: Vector2d): number {
    if (object.facingId === undefined) {
        return object.rotation;
    }
    const originalBaseRotation = getBaseFacingRotation(scene, object);
    const newBaseRotation = getBaseFacingRotation(scene, { ...object, x: object.x + offset.x, y: object.y + offset.y });
    return object.rotation + (originalBaseRotation - newBaseRotation);
}
