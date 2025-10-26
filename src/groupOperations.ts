import { Vector2d } from 'konva/lib/types';
import { isMoveable, SceneObject } from './scene';

export function moveObjectsBy(objects: readonly SceneObject[], offset: Partial<Vector2d>): SceneObject[] {
    return objects.filter(isMoveable).map((obj) => {
        return {
            ...obj,
            x: obj.x + (offset?.x ?? 0),
            y: obj.y + (offset?.y ?? 0),
        };
    });
}
