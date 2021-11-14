import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { COLOR_YELLOW } from './render/SceneTheme';

export enum EditMode {
    Default = 'default',
    Draw = 'draw',
}

export type EditModeState = [EditMode, Dispatch<SetStateAction<EditMode>>];

export const EditModeContext = createContext<EditModeState>([EditMode.Default, () => undefined]);

export const EditModeProvider: React.FC = ({ children }) => {
    const state = useState<EditMode>(EditMode.Default);

    return <EditModeContext.Provider value={state}>{children}</EditModeContext.Provider>;
};

export function useEditMode(): EditModeState {
    return useContext(EditModeContext);
}

export interface DrawConfig {
    brushSize: number;
    color: string;
    opacity: number;
}

const DEFAULT_DRAW_CONFIG: DrawConfig = {
    brushSize: 8,
    color: COLOR_YELLOW,
    opacity: 100,
};

export type DrawConfigState = [DrawConfig, Dispatch<SetStateAction<DrawConfig>>];

export const DrawConfigContext = createContext<DrawConfigState>([DEFAULT_DRAW_CONFIG, () => undefined]);

export const DrawConfigProvider: React.FC = ({ children }) => {
    const state = useState<DrawConfig>(DEFAULT_DRAW_CONFIG);

    return <DrawConfigContext.Provider value={state}>{children}</DrawConfigContext.Provider>;
};

export function useDrawConfig(): DrawConfigState {
    return useContext(DrawConfigContext);
}
