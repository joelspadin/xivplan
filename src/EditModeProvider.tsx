import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { COLOR_YELLOW } from './render/SceneTheme';
import { TetherType } from './scene';

export enum EditMode {
    Normal = 'normal',
    Draw = 'draw',
    Tether = 'tether',
}

export type EditModeState = [EditMode, Dispatch<SetStateAction<EditMode>>];

export const EditModeContext = createContext<EditModeState>([EditMode.Normal, () => undefined]);

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

export function useDrawConfig(): DrawConfigState {
    return useContext(DrawConfigContext);
}

export interface TetherConfig {
    tether: TetherType;
}

const DEFAULT_TETHER_CONFIG: TetherConfig = {
    tether: TetherType.Line,
};

export type TetherConfigState = [TetherConfig, Dispatch<SetStateAction<TetherConfig>>];

export const TetherConfigContext = createContext<TetherConfigState>([DEFAULT_TETHER_CONFIG, () => undefined]);

export function useTetherConfig(): TetherConfigState {
    return useContext(TetherConfigContext);
}

export const EditModeProvider: React.FC = ({ children }) => {
    const editMode = useState<EditMode>(EditMode.Normal);
    const drawConfig = useState<DrawConfig>(DEFAULT_DRAW_CONFIG);
    const tetherConfig = useState<TetherConfig>(DEFAULT_TETHER_CONFIG);

    return (
        <EditModeContext.Provider value={editMode}>
            <DrawConfigContext.Provider value={drawConfig}>
                <TetherConfigContext.Provider value={tetherConfig}>{children}</TetherConfigContext.Provider>
            </DrawConfigContext.Provider>
        </EditModeContext.Provider>
    );
};
