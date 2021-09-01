import * as React from 'react';
import { createContext, Dispatch, useContext, useReducer } from 'react';
import { Actor, Arena, ArenaShape, DEFAULT_SCENE, Grid, Marker, Scene, Tether, Zone } from './scene';

export interface SetArenaAction {
    type: 'arena';
    value: Arena;
}

export interface SetArenaShapeAction {
    type: 'arenaShape';
    value: ArenaShape;
}

export interface SetArenaWidthAction {
    type: 'arenaWidth';
    value: number;
}

export interface SetArenaHeightAction {
    type: 'arenaHeight';
    value: number;
}

export interface SetArenaGridAction {
    type: 'arenaGrid';
    value: Grid;
}

export interface SetArenaBackgroundAction {
    type: 'arenaBackground';
    value: string | undefined;
}

export interface ListSetAction<T> {
    op: 'set';
    value: T[];
}

export interface ListReplaceAction<T> {
    op: 'replace';
    index: number;
    value: T;
}

export interface ListAppendAction<T> {
    op: 'append';
    value: T;
}

export interface ListRemoveAction {
    op: 'remove';
    index: number;
}

export type ListAction<T> = ListSetAction<T> | ListAppendAction<T> | ListRemoveAction;

export type ZoneListAction = ListAction<Zone> & { type: 'zones' };
export type MarkerListAction = ListAction<Marker> & { type: 'markers' };
export type ActorListAction = ListAction<Actor> & { type: 'actors' };
export type TetherListAction = ListAction<Tether> & { type: 'tethers' };

export type SceneAction =
    | SetArenaAction
    | SetArenaShapeAction
    | SetArenaWidthAction
    | SetArenaHeightAction
    | SetArenaGridAction
    | SetArenaBackgroundAction;

export type SceneState = [Scene, Dispatch<SceneAction>];

export const SceneContext = createContext<SceneState>([DEFAULT_SCENE, () => undefined]);

export const SceneProvider: React.FunctionComponent = ({ children }) => {
    const reducer = useReducer(sceneReducer, DEFAULT_SCENE);

    return <SceneContext.Provider value={reducer}>{children}</SceneContext.Provider>;
};

export function useScene(): SceneState {
    return useContext(SceneContext);
}

function sceneReducer(state: Scene, action: SceneAction): Scene {
    switch (action.type) {
        case 'arena':
            return { ...state, arena: action.value };

        case 'arenaShape':
            return { ...state, arena: { ...state.arena, shape: action.value } };

        case 'arenaWidth':
            return { ...state, arena: { ...state.arena, width: action.value } };

        case 'arenaHeight':
            return { ...state, arena: { ...state.arena, height: action.value } };

        case 'arenaGrid':
            return { ...state, arena: { ...state.arena, grid: action.value } };

        case 'arenaBackground':
            return { ...state, arena: { ...state.arena, backgroundImage: action.value } };
    }
}
