import * as React from 'react';
import { Arena, ArenaShape, DEFAULT_SCENE, Grid, Scene, SceneObject, SceneObjectWithoutId } from './scene';
import { createUndoContext } from './undo/undoContext';
import { asArray } from './util';

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

interface ObjectUpdate {
    index: number;
    value: SceneObject;
}

export interface ObjectUpdateAction extends ObjectUpdate {
    type: 'update';
}

export interface ObjectUpdateManyAction {
    type: 'updateMany';
    updates: readonly ObjectUpdate[];
}

export interface ObjectAddAction {
    type: 'add';
    object: SceneObjectWithoutId | readonly SceneObjectWithoutId[];
}

export interface ObjectRemoveAction {
    type: 'remove';
    index: number | readonly number[];
}

export interface ObjectMoveAction {
    type: 'move';
    from: number;
    to: number;
}

export type ObjectAction =
    | ObjectAddAction
    | ObjectRemoveAction
    | ObjectMoveAction
    | ObjectUpdateAction
    | ObjectUpdateManyAction;

export type SceneAction =
    | SetArenaAction
    | SetArenaShapeAction
    | SetArenaWidthAction
    | SetArenaHeightAction
    | SetArenaGridAction
    | SetArenaBackgroundAction
    | ObjectAction;

const HISTORY_SIZE = 1000;

const { UndoProvider, Context, usePresent, useUndoRedo } = createUndoContext(sceneReducer, HISTORY_SIZE);

export const SceneProvider: React.FunctionComponent = ({ children }) => {
    return <UndoProvider initialState={DEFAULT_SCENE}>{children}</UndoProvider>;
};

export const SceneContext = Context;

export const useScene = usePresent;
export const useSceneUndoRedo = useUndoRedo;

function addObjects(
    state: Readonly<Scene>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
): Partial<Scene> {
    let nextId = state.nextId;
    const newObjects = asArray(objects).map((obj) => ({ id: nextId++, ...obj }));

    return {
        objects: [...state.objects, ...newObjects],
        nextId,
    };
}

function removeObjects(state: Readonly<Scene>, indices: readonly number[]): Partial<Scene> {
    return {
        objects: state.objects.filter((_, i) => !indices.includes(i)),
    };
}

function moveObject(state: Readonly<Scene>, from: number, to: number): Partial<Scene> {
    if (from === to) {
        return state;
    }

    const objects = state.objects.slice();
    const items = objects.splice(from, 1);
    objects.splice(to, 0, ...items);

    return { objects };
}

function updateObjects(state: Readonly<Scene>, updates: ObjectUpdate | readonly ObjectUpdate[]): Partial<Scene> {
    const objects = state.objects.slice();

    for (const update of asArray(updates)) {
        objects[update.index] = update.value;
    }

    return { objects };
}

function sceneReducer(state: Readonly<Scene>, action: SceneAction): Scene {
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

        case 'add':
            return { ...state, ...addObjects(state, action.object) };

        case 'remove':
            return { ...state, ...removeObjects(state, asArray(action.index)) };

        case 'move':
            return { ...state, ...moveObject(state, action.from, action.to) };

        case 'update':
            return { ...state, ...updateObjects(state, action) };

        case 'updateMany':
            return { ...state, ...updateObjects(state, action.updates) };
    }
}
