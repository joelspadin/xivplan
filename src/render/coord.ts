import { Point, Scene } from '../scene';
import { useScene } from '../SceneProvider';

export const SCENE_PADDING = 120;

export const ALIGN_TO_PIXEL = {
    offsetX: 0.5,
    offsetY: 0.5,
};

export function getCoordX(scene: Scene, x: number): number {
    const center = scene.arena.width / 2 + SCENE_PADDING;
    return center + x;
}

export function getCoordY(scene: Scene, y: number): number {
    const center = scene.arena.height / 2 + SCENE_PADDING;
    return center + y;
}

export function getCoord(scene: Scene, p: Point): Point {
    return { x: getCoordX(scene, p.x), y: getCoordY(scene, p.y) };
}

export function getCanvasSize(scene: Scene): { width: number; height: number } {
    return {
        width: scene.arena.width + SCENE_PADDING * 2,
        height: scene.arena.height + SCENE_PADDING * 2,
    };
}

export function getArenaRect(scene: Scene): { x: number; y: number; width: number; height: number } {
    const { x, y } = getCoord(scene, { x: -scene.arena.width / 2, y: -scene.arena.height / 2 });
    const width = scene.arena.width;
    const height = scene.arena.height;

    return { x, y, width, height };
}

export function getArenaEllipse(scene: Scene): { x: number; y: number; radiusX: number; radiusY: number } {
    const { x, y } = getCoord(scene, { x: 0, y: 0 });
    const radiusX = scene.arena.width / 2;
    const radiusY = scene.arena.height / 2;

    return { x, y, radiusX, radiusY };
}

export function useCoord(p: Point): Point {
    const [scene] = useScene();
    return getCoord(scene, p);
}

export function useArenaRect(): { x: number; y: number; width: number; height: number } {
    const [scene] = useScene();
    return getArenaRect(scene);
}

export function useArenaEllipse(): { x: number; y: number; radiusX: number; radiusY: number } {
    const [scene] = useScene();
    return getArenaEllipse(scene);
}
