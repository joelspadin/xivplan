import * as React from 'react';
import {
    Arena,
    ArenaShape,
    DEFAULT_SCENE,
    Grid,
    isTether,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    Tether,
} from './scene';
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

function getTetherIndex(objects: readonly SceneObject[], tether: Tether): number {
    // Tethers should be created below their targets.
    let startIdx = objects.findIndex((x) => x.id === tether.startId);
    let endIdx = objects.findIndex((x) => x.id === tether.endId);

    if (startIdx < 0) {
        startIdx = objects.length;
    }
    if (endIdx < 0) {
        endIdx = objects.length;
    }
    return Math.min(startIdx, endIdx);
}

function addObjects(
    state: Readonly<Scene>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
): Partial<Scene> {
    let nextId = state.nextId;
    const addedObjects = asArray(objects)
        .map((obj) => {
            if (obj.id !== undefined) {
                return obj as SceneObject;
            }
            return { ...obj, id: nextId++ };
        })
        .filter((obj) => {
            if (state.objects.some((existing) => existing.id === obj.id)) {
                console.error(`Cannot create new object with already-used ID ${obj.id}`);
                return false;
            }
            return true;
        });

    const result = [...state.objects];

    for (const object of addedObjects) {
        if (isTether(object)) {
            result.splice(getTetherIndex(result, object), 0, object);
        } else {
            result.push(object);
        }
    }

    return {
        objects: result,
        nextId,
    };
}

function removeObjects(state: Readonly<Scene>, ids: readonly number[]): Partial<Scene> {
    return {
        objects: state.objects.filter((object) => {
            if (ids.includes(object.id)) {
                return false;
            }

            if (isTether(object)) {
                // Delete any tether that is tethered to a deleted object.
                return !ids.includes(object.startId) && !ids.includes(object.endId);
            }

            return true;
        }),
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
