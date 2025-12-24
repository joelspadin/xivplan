import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { getAttachedObjects, getObjectById, useScene } from './SceneProvider';
import {
    DefaultAttachPosition,
    getDefaultAttachmentPreference,
    isMoveable,
    isRadiusObject,
    isResizable,
    MoveableObject,
    Scene,
    SceneObject,
} from './scene';
import { degtorad, round } from './util';
import { vecAngle } from './vector';

export const ALIGN_TO_PIXEL = {
    offsetX: -0.5,
    offsetY: -0.5,
};

export interface Position {
    readonly x: number;
    readonly y: number;
    readonly parentId?: number;
}

export function getCanvasX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + scene.arena.padding;
    return center + x;
}

export function getCanvasY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + scene.arena.padding;
    return center - y;
}

export function getParentPosition(scene: Scene, p: Position): Vector2d {
    if (p.parentId) {
        const parent = getObjectById(scene, p.parentId);
        if (isMoveable(parent)) {
            const grandparent = getParentPosition(scene, parent);
            return { x: grandparent.x + parent.x, y: grandparent.y + parent.y };
        }
    }
    return { x: 0, y: 0 };
}

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
 * @returns the given [p], as a position relative to the object with the Given [parentId] id
 */
export function makeRelative(scene: Scene, p: Vector2d, parentId?: number): Vector2d {
    const parent = getParentPosition(scene, { x: 0, y: 0, parentId });
    return { x: p.x - parent.x, y: p.y - parent.y };
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

export function getRelativeAttachmentPoint(
    scene: Scene,
    objectToAttach: SceneObject & MoveableObject,
    parent: SceneObject & MoveableObject,
    positionPreference: DefaultAttachPosition,
): Vector2d {
    // points relative to each object's origin where the attachment should happen.
    let objectAttatchmentPoint = { x: 0, y: 0 };
    let parentAttachmentPoint = { x: 0, y: 0 };
    switch (positionPreference) {
        case DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT:
        case DefaultAttachPosition.ANYWHERE:
            // For objects without a preference, keep them where they are.
            return makeRelative(scene, objectToAttach, parent.id);
        case DefaultAttachPosition.CENTER:
            return { x: 0, y: 0 };
        case DefaultAttachPosition.TOP: {
            if (isResizable(objectToAttach)) {
                objectAttatchmentPoint = { x: 0, y: -objectToAttach.height / 2 };
            } else if (isRadiusObject(objectToAttach)) {
                objectAttatchmentPoint = { x: 0, y: -objectToAttach.radius };
            }

            // If there are already-attached and still-pinned TOP objects, assume they're all
            // in their default position and add this new one above them.
            let addedHeight = 0;
            for (const attachment of getAttachedObjects(scene, parent)) {
                if (!attachment.pinned) {
                    continue;
                }
                if (getDefaultAttachmentPreference(attachment) == DefaultAttachPosition.TOP) {
                    if (isResizable(attachment)) {
                        addedHeight += attachment.height;
                    } else if (isRadiusObject(attachment)) {
                        addedHeight += attachment.radius * 2;
                    }
                }
            }
            if (isResizable(parent)) {
                parentAttachmentPoint = { x: 0, y: parent.height / 2 + addedHeight };
            } else if (isRadiusObject(parent)) {
                parentAttachmentPoint = { x: 0, y: parent.radius + addedHeight };
            }
            break;
        }
        case DefaultAttachPosition.BOTTOM_RIGHT: {
            if (isResizable(objectToAttach)) {
                objectAttatchmentPoint = { x: -objectToAttach.width / 2, y: objectToAttach.height / 2 };
            } else if (isRadiusObject(objectToAttach)) {
                const offset = Math.sqrt(objectToAttach.radius ** 2 / 2);
                objectAttatchmentPoint = { x: -offset, y: offset };
            }
            // If there are already-attached and still-pinned BOTTOM_RIGHT objects, assume
            // they're all in their default position and add this new one to the right of them.
            let addedOffset = 0;
            for (const attachment of getAttachedObjects(scene, parent)) {
                if (!attachment.pinned) {
                    continue;
                }
                if (getDefaultAttachmentPreference(attachment) == DefaultAttachPosition.BOTTOM_RIGHT) {
                    if (isResizable(attachment)) {
                        addedOffset += attachment.width;
                    } else if (isRadiusObject(attachment)) {
                        addedOffset += attachment.radius * 2;
                    }
                }
            }

            const overlap = 0.9;
            if (isResizable(parent)) {
                parentAttachmentPoint = {
                    x: (parent.width / 2) * (1 - overlap) + addedOffset,
                    y: -(parent.height / 2) * (1 - overlap),
                };
            } else if (isRadiusObject(parent)) {
                const offset = Math.sqrt(parent.radius ** 2 / 2) * (1 - overlap);
                parentAttachmentPoint = { x: offset + addedOffset, y: -offset };
            }
            break;
        }
    }
    return {
        x: parentAttachmentPoint.x - objectAttatchmentPoint.x,
        y: parentAttachmentPoint.y - objectAttatchmentPoint.y,
    };
}
