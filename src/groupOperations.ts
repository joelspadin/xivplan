import type { Vector2d } from 'konva/lib/types';
import { isMoveable, type SceneObject } from './scene';

/** Move objects by the given offset. If an input object is move moveable, it is omitted form the output. */
export function moveObjectsBy(objects: readonly SceneObject[], offset: Partial<Vector2d>): SceneObject[] {
    return objects.filter(isMoveable).map((obj) => {
        return {
            ...obj,
            x: obj.x + (offset?.x ?? 0),
            y: obj.y + (offset?.y ?? 0),
        };
    });
}
