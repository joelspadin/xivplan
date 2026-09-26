import type { Vector2d } from 'konva/lib/types';
import {
    hasLineProperties,
    ObjectType,
    type BaseObject,
    type CircleZone,
    type EnemyObject,
    type ExaflareZone,
    type ObjectPrototype,
    type RectangleZone,
    type SceneObjectPrototype,
    type TextObject,
} from '../scene';
import { vecAdd, vecMult } from '../vector';

const MARGIN = 10;

const TEXT_WIDTH = 80;
const TEXT_HEIGHT = 40;

/**
 * Get the size of the canvas needed for an object preview.
 */
export function getObjectPreviewSize(object: SceneObjectPrototype): Vector2d {
    if (hasWidthHeight(object)) {
        return {
            x: object.width + MARGIN,
            y: object.height + MARGIN,
        };
    }

    // Exaflares have a radius but render more like a line object, so this check
    // must be before hasRadius.
    if (isExaflarePrototype(object)) {
        return {
            x: object.radius * 2 + MARGIN,
            y: getExaflareSpacing(object) * (object.length + 1) + MARGIN,
        };
    }

    // Enemies have a radius but need a larger margin due to the arrow at the
    // front of the ring and the subtle glow around the ring. Similarly, rotate
    // zones have arrows that extend outside the radius.
    if (isEnemyPrototype(object) || isRotateZonePrototype(object)) {
        const size = object.radius * 2.4 + MARGIN;
        return { x: size, y: size };
    }

    if (hasRadius(object)) {
        const size = object.radius * 2 + MARGIN;
        return { x: size, y: size };
    }

    if (hasLineProperties(object)) {
        return {
            x: object.width + MARGIN,
            y: object.length + MARGIN,
        };
    }

    if (isTextPrototype(object)) {
        return { x: TEXT_WIDTH, y: TEXT_HEIGHT };
    }

    console.error('Unhandled object type for preview size:', object.type);
    return { x: 100, y: 100 };
}

/**
 * Get the center position of the object within the object preview scene.
 */
export function getObjectPreviewPosition(object: SceneObjectPrototype): Vector2d {
    if (hasLineProperties(object)) {
        return {
            x: 0,
            y: -object.length / 2,
        };
    }

    if (isExaflarePrototype(object)) {
        return {
            x: 0,
            y: -(getExaflareSpacing(object) * (object.length - 1)) / 2,
        };
    }

    return { x: 0, y: 0 };
}

/**
 * Get the offset of the object preview canvas from the drop location for drag handling.
 */
export function getObjectPreviewDragOffset(object: SceneObjectPrototype): Vector2d {
    // The center of the right triangle object is along its hypotenuse, which is
    // an awkard place to center it on the mouse. Shift it to place the mouse on
    // the centroid.
    if (isRightTrianglePrototype(object)) {
        return {
            x: -Math.round(object.width / 6),
            y: Math.round(object.height / 6),
        };
    }

    // The center of the equilateral triangle object is the vertical midpoint of
    // the triangle. Shift it to place the mouse on the centroid.
    if (isTrianglePrototype(object)) {
        return {
            x: 0,
            y: object.height / 2 - object.width / 2 / Math.sqrt(3),
        };
    }

    return { x: 0, y: 0 };
}

/**
 * Get the offset of the object preview canvas from the mouse for drag handling.
 */
export function getObjectPreviewMouseOffset(object: SceneObjectPrototype): Vector2d {
    if (hasLineProperties(object)) {
        return {
            x: (object.width + MARGIN) / 2,
            y: object.length + MARGIN / 2,
        };
    }

    if (isExaflarePrototype(object)) {
        return {
            x: object.radius + MARGIN / 2,
            y: getExaflareSpacing(object) * object.length + MARGIN / 2,
        };
    }

    const size = getObjectPreviewSize(object);
    const offset = getObjectPreviewDragOffset(object);

    return vecAdd(vecMult(size, 0.5), offset);
}

/**
 * ResizeableObject extends MoveableObject, which has a position. SceneObjectPrototype has no position, so we cannot
 * use isResizable() to identify objects with a width and height.
 */
function hasWidthHeight(
    object: SceneObjectPrototype,
): object is ObjectPrototype<BaseObject & { type: ObjectType; width: number; height: number }> {
    return (
        'width' in object && 'height' in object && typeof object.width === 'number' && typeof object.height === 'number'
    );
}

/**
 * RadiusObject extends MoveableObject, which has a position. SceneObjectPrototype has no position, so we cannot
 * use isRadiusObject() to identify objects with a radius.
 */
function hasRadius(
    object: SceneObjectPrototype,
): object is ObjectPrototype<BaseObject & { type: ObjectType; radius: number }> {
    return 'radius' in object && typeof object.radius === 'number';
}

function isEnemyPrototype(object: SceneObjectPrototype): object is ObjectPrototype<EnemyObject> {
    return object.type === ObjectType.Enemy;
}

function isExaflarePrototype(object: SceneObjectPrototype): object is ObjectPrototype<ExaflareZone> {
    return object.type === ObjectType.Exaflare;
}

function isRightTrianglePrototype(object: SceneObjectPrototype): object is ObjectPrototype<RectangleZone> {
    return object.type === ObjectType.RightTriangle;
}

function isRotateZonePrototype(object: SceneObjectPrototype): object is ObjectPrototype<CircleZone> {
    return object.type === ObjectType.RotateCW || object.type === ObjectType.RotateCCW;
}

function isTextPrototype(object: SceneObjectPrototype): object is ObjectPrototype<TextObject> {
    return object.type === ObjectType.Text;
}

function isTrianglePrototype(object: SceneObjectPrototype): object is ObjectPrototype<RectangleZone> {
    return object.type === ObjectType.Triangle;
}

function getExaflareSpacing(object: ObjectPrototype<ExaflareZone>): number {
    return object.radius * 2 * (object.spacing / 100);
}
