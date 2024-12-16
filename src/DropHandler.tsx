import { Vector2d } from 'konva/lib/types';
import React from 'react';
import { PanelDragObject } from './PanelDragContext';
import { SceneAction } from './SceneProvider';
import { SceneObject } from './scene';
import { asArray, round } from './util';

export type DropHandler<T extends SceneObject> = (object: Partial<T>, position: Vector2d) => SceneAction;
const dropHandlers: Record<string, DropHandler<SceneObject>> = {};

export function registerDropHandler<T extends SceneObject>(types: string | string[], handler: DropHandler<T>): void {
    for (const type of asArray(types)) {
        dropHandlers[type] = handler as DropHandler<SceneObject>;
    }
}

export function getDropAction(object: PanelDragObject, position: Vector2d): SceneAction | undefined {
    if (!object.object.type) {
        throw new Error('Drag object is missing type');
    }

    const handler = dropHandlers[object.object.type];
    if (handler) {
        return handler(object.object as SceneObject, position);
    }
    return undefined;
}

export function getDragOffset(e: React.DragEvent<HTMLElement>): Vector2d {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    return round({ x: e.clientX - centerX, y: e.clientY - centerY });
}
