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

export interface SetArenaPaddingAction {
    type: 'arenaPadding';
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

export interface ObjectUpdateAction {
    type: 'update';
    value: SceneObject | readonly SceneObject[];
}

export interface ObjectAddAction {
    type: 'add';
    object: SceneObjectWithoutId | readonly SceneObjectWithoutId[];
}

export interface ObjectRemoveAction {
    type: 'remove';
    ids: number | readonly number[];
}

export interface ObjectMoveAction {
    type: 'move';
    from: number;
    to: number;
}

export interface GroupMoveAction {
    type: 'moveUp' | 'moveDown' | 'moveToTop' | 'moveToBottom';
    ids: number | readonly number[];
}

export type ObjectAction =
    | ObjectAddAction
    | ObjectRemoveAction
    | ObjectMoveAction
    | GroupMoveAction
    | ObjectUpdateAction;

export type SceneAction =
    | SetArenaAction
    | SetArenaShapeAction
    | SetArenaWidthAction
    | SetArenaHeightAction
    | SetArenaPaddingAction
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

export function getObjectById(scene: Scene, id: number): SceneObject | undefined {
    const index = scene.objects.findIndex((o) => o.id === id);
    return index >= 0 ? scene.objects[index] : undefined;
}

function addObjects(
    state: Readonly<Scene>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
): Partial<Scene> {
    let nextId = state.nextId;
    const newObjects = asArray(objects).map((obj) => ({ ...obj, id: nextId++ }));

    return {
        objects: [...state.objects, ...newObjects],
        nextId,
    };
}

function removeObjects(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    return {
        objects: state.objects.filter((object) => !ids.includes(object.id)),
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

function mapSelected(state: Readonly<Scene>, ids: readonly number[]) {
    return state.objects.map((object) => ({ object, selected: ids.includes(object.id) }));
}

function unmapSelected(objects: { object: SceneObject; selected: boolean }[]): Partial<Scene> {
    return {
        objects: objects.map((o) => o.object),
    };
}

function moveGroupUp(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    const objects = mapSelected(state, ids);

    for (let i = objects.length - 1; i > 0; i--) {
        const current = objects[i];
        const next = objects[i - 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i - 1] = current;
        }
    }

    return unmapSelected(objects);
}

function moveGroupDown(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    const objects = mapSelected(state, ids);

    for (let i = 0; i < objects.length - 1; i++) {
        const current = objects[i];
        const next = objects[i + 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i + 1] = current;
        }
    }

    return unmapSelected(objects);
}

function moveGroupToTop(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    const objects = mapSelected(state, ids);

    objects.sort((a, b) => {
        return (a.selected ? 1 : 0) - (b.selected ? 1 : 0);
    });

    return unmapSelected(objects);
}

function moveGroupToBottom(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    const objects = mapSelected(state, ids);

    objects.sort((a, b) => {
        return (b.selected ? 1 : 0) - (a.selected ? 1 : 0);
    });

    return unmapSelected(objects);
}

function updateObjects(state: Readonly<Scene>, values: readonly SceneObject[]): Partial<Scene> {
    const objects = state.objects.slice();

    for (const update of asArray(values)) {
        const index = objects.findIndex((o) => o.id === update.id);
        if (index >= 0) {
            objects[index] = update;
        }
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

        case 'arenaPadding':
            return { ...state, arena: { ...state.arena, padding: action.value } };

        case 'arenaGrid':
            return { ...state, arena: { ...state.arena, grid: action.value } };

        case 'arenaBackground':
            return { ...state, arena: { ...state.arena, backgroundImage: action.value } };

        case 'add':
            return { ...state, ...addObjects(state, action.object) };

        case 'remove':
            return { ...state, ...removeObjects(state, asArray(action.ids)) };

        case 'move':
            return { ...state, ...moveObject(state, action.from, action.to) };

        case 'moveUp':
            return { ...state, ...moveGroupUp(state, asArray(action.ids)) };

        case 'moveDown':
            return { ...state, ...moveGroupDown(state, asArray(action.ids)) };

        case 'moveToTop':
            return { ...state, ...moveGroupToTop(state, asArray(action.ids)) };

        case 'moveToBottom':
            return { ...state, ...moveGroupToBottom(state, asArray(action.ids)) };

        case 'update':
            return { ...state, ...updateObjects(state, asArray(action.value)) };
    }
}
