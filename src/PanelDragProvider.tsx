import { Vector2d } from 'konva/lib/types';
import React, { createContext, Dispatch, useCallback, useContext, useState } from 'react';
import { EditMode, useEditMode } from './EditModeProvider';
import { SceneObject } from './scene';
import { SceneAction } from './SceneProvider';
import { asArray } from './util';

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
    const [dragObject, setDragObject] = useContext(PanelDragContext);
    const [, setEditMode] = useEditMode();

    const wrappedSet = useCallback(
        (value: PanelDragObject | null) => {
            // Drag and dropping an object should cancel tether inputs.
            setEditMode(EditMode.Normal);
            setDragObject(value);
        },
        [setDragObject, setEditMode],
    );

    return [dragObject, wrappedSet];
}

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

    return { x: e.clientX - centerX, y: e.clientY - centerY };
}
