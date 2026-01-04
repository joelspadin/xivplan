import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { getObjectById, useScene } from './SceneProvider';
import { isMoveable, isRotateable, MoveableObject, RotateableObject, Scene, SceneObject } from './scene';
import { degtorad, round } from './util';
import { vecAngle } from './vector';

export const ALIGN_TO_PIXEL = {
    offsetX: -0.5,
    offsetY: -0.5,
};

export interface Position {
    readonly x: number;
    readonly y: number;
    readonly positionParentId?: number;
}

export function getCanvasX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + scene.arena.padding;
    return center + x;
}

export function getCanvasY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + scene.arena.padding;
    return center - y;
}

/** @returns the absolute position of the 'parent' object, or (0,0) if there is no parent. */
export function getParentPosition(scene: Scene, p: Position): Vector2d {
    const parentIdSet = new Set<number>();
    let parentId = p.positionParentId;
    const position: Vector2d = { x: 0, y: 0 };
    while (parentId !== undefined) {
        if (parentIdSet.has(parentId)) {
            console.error('cyclic positional dependency');
            return { x: 0, y: 0 };
        }
        parentIdSet.add(parentId);
        const parent = getObjectById(scene, parentId);
        if (isMoveable(parent)) {
            position.x += parent.x;
            position.y += parent.y;
            parentId = parent.positionParentId;
        } else {
            break;
        }
    }
    return position;
}

/** @returns the actual position in the scene, while taking into account any position parents. */
export function getAbsolutePosition(scene: Scene, p: Position): Vector2d {
    const parent = getParentPosition(scene, p);
    return { x: parent.x + p.x, y: parent.y + p.y };
}

export function getCanvasCoord(scene: Scene, p: Position): Vector2d {
    const absolutePos = getAbsolutePosition(scene, p);
    return { x: getCanvasX(scene, absolutePos.x), y: getCanvasY(scene, absolutePos.y) };
}

export function getCanvasSize(scene: Scene): { width: number; height: number } {
    return {
        width: scene.arena.width + scene.arena.padding * 2,
        height: scene.arena.height + scene.arena.padding * 2,
    };
}

export function getCanvasArenaRect(scene: Scene): { x: number; y: number; width: number; height: number } {
    const { x, y } = getCanvasCoord(scene, { x: -scene.arena.width / 2, y: scene.arena.height / 2 });
    const width = scene.arena.width;
    const height = scene.arena.height;

    return { x, y, width, height };
}

export function getCanvasArenaEllipse(scene: Scene): { x: number; y: number; radiusX: number; radiusY: number } {
    const { x, y } = getCanvasCoord(scene, { x: 0, y: 0 });
    const radiusX = scene.arena.width / 2;
    const radiusY = scene.arena.height / 2;

    return { x, y, radiusX, radiusY };
}

export function useCanvasCoord(p: Position): Vector2d {
    const { scene } = useScene();
    return getCanvasCoord(scene, p);
}

export function useCanvasArenaRect(): { x: number; y: number; width: number; height: number } {
    const { scene } = useScene();
    return getCanvasArenaRect(scene);
}

export function useCanvasArenaEllipse(): { x: number; y: number; radiusX: number; radiusY: number } {
    const { scene } = useScene();
    return getCanvasArenaEllipse(scene);
}

export function getSceneX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + scene.arena.padding;
    return x - center;
}

export function getSceneY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + scene.arena.padding;
    return center - y;
}

export function getSceneCoord(scene: Scene, p: Position): Vector2d {
    const absolutePos = getAbsolutePosition(scene, p);
    return round({ x: getSceneX(scene, absolutePos.x), y: getSceneY(scene, absolutePos.y) });
}

/**
 * @returns the given [p], as a position relative to the object with the given [positionParentId] id
 */
export function makeRelative(scene: Scene, p: Vector2d, positionParentId?: number): Vector2d {
    const parent = getParentPosition(scene, { x: 0, y: 0, positionParentId });
    return { x: p.x - parent.x, y: p.y - parent.y };
}

/** @returns the angle that is considered '0 degrees rotated' for the given object. */
export function getBaseFacingRotation(scene: Scene, object: RotateableObject & MoveableObject): number {
    if (object.facingId !== undefined) {
        const facingObject = getObjectById(scene, object.facingId);
        if (facingObject && isMoveable(facingObject)) {
            return getRotationToFaceTarget(scene, object, facingObject);
        }
    }
    return 0;
}

/** Calculates the rotation of the object while taking into account the object it may be configured to be facing. */
export function getAbsoluteRotation(scene: Scene, object: RotateableObject & MoveableObject): number {
    return getBaseFacingRotation(scene, object) + object.rotation;
}

/** @returns the angle to rotate an up-facing object at the given origin to make it face towards the target (in degrees) */
function getRotationToFaceTarget(
    scene: Scene,
    origin: MoveableObject & RotateableObject,
    target: SceneObject & MoveableObject,
): number {
    // If the origin is _also_ attached to the target positionally and _also_ on exactly the same location, face the same
    // direction as the target instead of whatever arbitrary direction the (0,0) vector yields.
    // Positional connections are guaranteed to not have a circular dependency [without manual editing of the plan files].
    if (origin.positionParentId === target.id && origin.x == 0 && origin.y == 0 && isRotateable(target)) {
        return getAbsoluteRotation(scene, target);
    }
    const originPosition = getAbsolutePosition(scene, origin);
    const targetPosition = getAbsolutePosition(scene, target);

    return getPointerAngle({ x: targetPosition.x - originPosition.x, y: targetPosition.y - originPosition.y });
}

export function rotateCoord(p: Vector2d, angle: number, center: Vector2d = { x: 0, y: 0 }): Vector2d {
    const cos = Math.cos(degtorad(-angle));
    const sin = Math.sin(degtorad(-angle));

    const offsetX = p.x - center.x;
    const offsetY = p.y - center.y;
    const rotatedX = offsetX * cos - offsetY * sin;
    const rotatedY = offsetX * sin + offsetY * cos;

    return { x: center.x + rotatedX, y: center.y + rotatedY };
}

export function snapAngle(angle: number, snapDivision: number, snapTolerance: number): number {
    const divAngle = ((angle % snapDivision) + snapDivision) % snapDivision;

    if (divAngle > snapTolerance && divAngle < snapDivision - snapTolerance) {
        return angle;
    }

    return Math.round(angle / snapDivision) * snapDivision;
}

export function getPointerAngle(pos: Vector2d): number {
    return vecAngle(pos);
}

export function getPointerPosition(scene: Scene, stage: Stage | undefined | null): Vector2d | null {
    const pos = stage?.getPointerPosition();
    if (!pos) {
        return null;
    }
    return getSceneCoord(scene, pos);
}

export interface Circle {
    readonly x: number;
    readonly y: number;
    readonly radius: number;
}

/**
 * @returns whether point [p] is within (or on the edge of) circle [c]
 */
export function isWithinRadius(c: Circle, p: Vector2d): boolean {
    const distanceSq = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
    return distanceSq <= c.radius ** 2;
}

export interface Box {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

/**
 * @returns whether point [p] is within (or on the edge of) box [b]
 */
export function isWithinBox(b: Box, p: Vector2d): boolean {
    return Math.abs(p.x - b.x) <= b.width / 2 && Math.abs(p.y - b.y) <= b.height / 2;
}
