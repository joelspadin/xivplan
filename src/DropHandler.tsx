import type { Vector2d } from 'konva/lib/types';
import React from 'react';
import type { PanelDragObject } from './PanelDragContext';
import type { SceneAction } from './SceneProvider';
import { round } from './util';

export function getDropAction(object: PanelDragObject, position: Vector2d): SceneAction | undefined {
    return {
        type: 'add',
        object: { ...object.object, ...position },
    };
}

export function getDragOffset(e: React.MouseEvent<HTMLElement>): Vector2d {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    return round({ x: e.clientX - centerX, y: e.clientY - centerY });
}
