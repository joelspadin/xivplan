import { createContext, Dispatch, SetStateAction } from 'react';
import { EditMode } from './editMode';
import { TetherType } from './scene';
import { COLOR_YELLOW } from './theme';

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

export enum ConnectionType {
    POSITION = 'position',
    ROTATION = 'rotation',
}

export interface ConnectionSelectionConfig {
    objectIdsToConnect: ReadonlySet<number>;
    connectionType: ConnectionType;
}

export const DEFAULT_CONNECTION_SELECTION_CONFIG: ConnectionSelectionConfig = {
    objectIdsToConnect: new Set(),
    connectionType: ConnectionType.POSITION,
};

export type ConnectionSelectionConfigState = [
    ConnectionSelectionConfig,
    Dispatch<SetStateAction<ConnectionSelectionConfig>>,
];

export const ConnectionSelectionContext = createContext<ConnectionSelectionConfigState>([
    DEFAULT_CONNECTION_SELECTION_CONFIG,
    () => undefined,
]);
