import * as React from 'react';
import { Actor, Arena, ArenaShape, DEFAULT_SCENE, Grid, Marker, Scene, Tether, Zone } from './scene';
import { createUndoContext } from './undo/undoContext';

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

export interface ListUpdateAction<T> {
    op: 'update';
    index: number;
    value: T;
}

export interface ListAddAction<T> {
    op: 'add';
    value: T;
}

export interface ListRemoveAction {
    op: 'remove';
    index: number;
}

export interface ListMoveAction {
    op: 'move';
    from: number;
    to: number;
}

export type ListAction<T> = ListAddAction<T> | ListUpdateAction<T> | ListRemoveAction | ListMoveAction;

export type EditList = 'zones' | 'markers' | 'actors' | 'tethers';

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
    | SetArenaBackgroundAction
    | ZoneListAction
    | MarkerListAction
    | ActorListAction
    | TetherListAction;

const HISTORY_SIZE = 1000;

const { UndoProvider, Context, usePresent, useUndoRedo } = createUndoContext(sceneReducer, HISTORY_SIZE);

export const SceneProvider: React.FunctionComponent = ({ children }) => {
    return <UndoProvider initialState={DEFAULT_SCENE}>{children}</UndoProvider>;
};

export const SceneContext = Context;

export const useScene = usePresent;
export const useSceneUndoRedo = useUndoRedo;

function listActionReducer<T>(state: T[], action: ListAction<T>): T[] {
    switch (action.op) {
        case 'add':
            return [...state, action.value];

        case 'remove':
            return [...state.slice(0, action.index), ...state.slice(action.index + 1)];

        case 'move': {
            if (action.from === action.to) {
                return state;
            }

            const newState = state.slice();
            const items = newState.splice(action.from, 1);
            newState.splice(action.to, 0, ...items);
            return newState;
        }

        case 'update': {
            const newState = state.slice();
            newState[action.index] = action.value;
            return newState;
        }
    }
}

function adjustTetherIndex(index: number, action: ListMoveAction): number {
    if (index === action.from) {
        return action.to;
    }

    if (index >= action.to && index < action.from) {
        return index + 1;
    }

    return index;
}

function adjustTetherList(state: Tether[], action: ActorListAction): Tether[] {
    switch (action.op) {
        case 'add':
        case 'update':
            return state;

        case 'remove':
            // Actor was removed. Need to remove tethers that referenced it and
            // update indices since actors after it are shifted down by one.
            return state
                .filter((tether) => tether.start !== action.index && tether.end !== action.index)
                .map((tether) => {
                    if (tether.start > action.index) {
                        tether.start--;
                    }
                    if (tether.end > action.index) {
                        tether.end--;
                    }
                    return tether;
                });

        case 'move':
            if (action.from === action.to) {
                return state;
            }

            return state.map((tether) => {
                return {
                    ...tether,
                    start: adjustTetherIndex(tether.start, action),
                    end: adjustTetherIndex(tether.end, action),
                };
            });
    }
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

        case 'zones':
            return { ...state, zones: listActionReducer(state.zones, action) };

        case 'markers':
            return { ...state, markers: listActionReducer(state.markers, action) };

        case 'actors':
            return {
                ...state,
                actors: listActionReducer(state.actors, action),
                tethers: adjustTetherList(state.tethers, action),
            };

        case 'tethers':
            return { ...state, tethers: listActionReducer(state.tethers, action) };
    }
}
