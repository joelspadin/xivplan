import { Vector2d } from 'konva/lib/types';
import React, { createContext, Dispatch, useContext, useState } from 'react';
import { SceneObject } from './scene';
import { SceneAction } from './SceneProvider';

export interface PanelDragObject {
    object: Partial<SceneObject>;
    offset: Vector2d;
}

export type PanelDragState = [PanelDragObject | null, Dispatch<PanelDragObject | null>];

export const PanelDragContext = createContext<PanelDragState>([null, () => undefined]);

export const PanelDragProvider: React.FunctionComponent = ({ children }) => {
    const state = useState<PanelDragObject | null>(null);

    return <PanelDragContext.Provider value={state}>{children}</PanelDragContext.Provider>;
};

export function usePanelDrag(): PanelDragState {
    return useContext(PanelDragContext);
}

export type DropHandler<T extends SceneObject> = (object: Partial<T>, position: Vector2d) => SceneAction;

const dropHandlers: Record<string, DropHandler<SceneObject>> = {};

export function registerDropHandler<T extends SceneObject>(types: string | string[], handler: DropHandler<T>): void {
    types = Array.isArray(types) ? types : [types];

    for (const type of types) {
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

    return { x: e.clientX - centerX, y: e.clientY - centerY };
}
