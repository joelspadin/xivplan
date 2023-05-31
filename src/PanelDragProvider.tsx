import { Vector2d } from 'konva/lib/types';
import React, { createContext, Dispatch, PropsWithChildren, useState } from 'react';
import { SceneObject } from './scene';

export interface PanelDragObject {
    object: Partial<SceneObject>;
    offset: Vector2d;
}

export type PanelDragState = [PanelDragObject | null, Dispatch<PanelDragObject | null>];

export const PanelDragContext = createContext<PanelDragState>([null, () => undefined]);

export const PanelDragProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<PanelDragObject | null>(null);

    return <PanelDragContext.Provider value={state}>{children}</PanelDragContext.Provider>;
};
