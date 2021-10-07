import { Vector2d } from 'konva/lib/types';
import { Scene } from '../scene';
import { useScene } from '../SceneProvider';

export const SCENE_PADDING = 120;

export const ALIGN_TO_PIXEL = {
    offsetX: -0.5,
    offsetY: -0.5,
};

export function getCanvasX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + SCENE_PADDING;
    return center + x;
}

export function getCanvasY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + SCENE_PADDING;
    return center - y;
}

export function getCanvasCoord(scene: Scene, p: Vector2d): Vector2d {
    return { x: getCanvasX(scene, p.x), y: getCanvasY(scene, p.y) };
}

export function getCanvasSize(scene: Scene): { width: number; height: number } {
    return {
        width: scene.arena.width + SCENE_PADDING * 2,
        height: scene.arena.height + SCENE_PADDING * 2,
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
    const [scene] = useScene();
    return getCanvasCoord(scene, p);
}

export function useCanvasArenaRect(): { x: number; y: number; width: number; height: number } {
    const [scene] = useScene();
    return getCanvasArenaRect(scene);
}

export function useCanvasArenaEllipse(): { x: number; y: number; radiusX: number; radiusY: number } {
    const [scene] = useScene();
    return getCanvasArenaEllipse(scene);
}

export function getSceneX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + SCENE_PADDING;
    return x - center;
}

export function getSceneY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + SCENE_PADDING;
    return center - y;
}

export function getSceneCoord(scene: Scene, p: Vector2d): Vector2d {
    return { x: getSceneX(scene, p.x), y: getSceneY(scene, p.y) };
}
