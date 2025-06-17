import { createContext, Dispatch, SetStateAction } from 'react';
import { EditMode } from './editMode';
import { COLOR_YELLOW } from './render/sceneTheme';
import { TetherType } from './scene';

export type EditModeState = [EditMode, Dispatch<SetStateAction<EditMode>>];

export const EditModeContext = createContext<EditModeState>([EditMode.Normal, () => undefined]);

export interface DrawConfig {
    brushSize: number;
    color: string;
    opacity: number;
}

export const DEFAULT_DRAW_CONFIG: DrawConfig = {
    brushSize: 8,
    color: COLOR_YELLOW,
    opacity: 100,
};

export type DrawConfigState = [DrawConfig, Dispatch<SetStateAction<DrawConfig>>];

export const DrawConfigContext = createContext<DrawConfigState>([DEFAULT_DRAW_CONFIG, () => undefined]);

export interface TetherConfig {
    tether: TetherType;
}

export const DEFAULT_TETHER_CONFIG: TetherConfig = {
    tether: TetherType.Line,
};

export type TetherConfigState = [TetherConfig, Dispatch<SetStateAction<TetherConfig>>];

export const TetherConfigContext = createContext<TetherConfigState>([DEFAULT_TETHER_CONFIG, () => undefined]);
