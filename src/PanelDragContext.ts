import type { Vector2d } from 'konva/lib/types';
import { createContext, type Dispatch } from 'react';
import type { SceneObjectPrototype } from './scene';

export interface PanelDragObject {
    object: SceneObjectPrototype;
    offset: Vector2d;
}

export type PanelDragState = [PanelDragObject | null, Dispatch<PanelDragObject | null>];

export const PanelDragContext = createContext<PanelDragState>([null, () => undefined]);
