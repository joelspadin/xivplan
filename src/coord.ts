import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { useScene } from './SceneProvider';
import { Scene } from './scene';
import { degtorad, round } from './util';
import { vecAngle } from './vector';

export const ALIGN_TO_PIXEL = {
    offsetX: -0.5,
    offsetY: -0.5,
};

export function getCanvasX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + scene.arena.padding;
    return center + x;
}

export function getCanvasY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + scene.arena.padding;
    return center - y;
}

export function getCanvasCoord(scene: Scene, p: Vector2d): Vector2d {
    return { x: getCanvasX(scene, p.x), y: getCanvasY(scene, p.y) };
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

export function useCanvasCoord(p: Vector2d): Vector2d {
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

export function getSceneCoord(scene: Scene, p: Vector2d): Vector2d {
    return round({ x: getSceneX(scene, p.x), y: getSceneY(scene, p.y) });
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
