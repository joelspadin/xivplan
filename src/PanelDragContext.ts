import { Vector2d } from 'konva/lib/types';
import { createContext, Dispatch } from 'react';
import { SceneObject } from './scene';

export interface PanelDragObject {
    object: Partial<SceneObject>;
    offset: Vector2d;
}

export type PanelDragState = [PanelDragObject | null, Dispatch<PanelDragObject | null>];

export const PanelDragContext = createContext<PanelDragState>([null, () => undefined]);
