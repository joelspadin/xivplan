/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';
import { copyObjects } from './copy';
import {
    Arena,
    ArenaShape,
    DEFAULT_SCENE,
    Grid,
    isTether,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    SceneStep,
    Tether,
    Ticks,
} from './scene';
import { createUndoContext } from './undo/undoContext';
import { useSetSavedState } from './useIsDirty';
import { asArray, clamp } from './util';

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

export interface SetArenaTicksActions {
    type: 'arenaTicks';
    value: Ticks;
}

export interface SetArenaBackgroundAction {
    type: 'arenaBackground';
    value: string | undefined;
}

export interface SetArenaBackgroundOpacityAction {
    type: 'arenaBackgroundOpacity';
    value: number;
}

export type ArenaAction =
    | SetArenaAction
    | SetArenaShapeAction
    | SetArenaWidthAction
    | SetArenaHeightAction
    | SetArenaPaddingAction
    | SetArenaGridAction
    | SetArenaTicksActions
    | SetArenaBackgroundAction
    | SetArenaBackgroundOpacityAction;

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

export interface SetStepAction {
    type: 'setStep';
    index: number;
}

export interface IncrementStepAction {
    type: 'nextStep' | 'previousStep';
}

export interface AddStepAction {
    type: 'addStep';
    after?: number;
}

export interface RemoveStepAction {
    type: 'removeStep';
    index: number;
}

export interface ReorderStepsAction {
    type: 'reoderSteps';
    order: number[];
}

export type StepAction = SetStepAction | IncrementStepAction | AddStepAction | RemoveStepAction | ReorderStepsAction;

// TODO: the source should be separate from the undo history
export interface SetSourceAction {
    type: 'setSource';
    source: FileSource | undefined;
}

export type SceneAction = ArenaAction | ObjectAction | StepAction | SetSourceAction;

export interface LocalStorageFileSource {
    type: 'local';
    name: string;
}

export interface FileSystemFileSource {
    type: 'fs';
    name: string;
    handle: FileSystemFileHandle;
}

export interface BlobFileSource {
    type: 'blob';
    name: string;
    file?: File;
}

export type FileSource = LocalStorageFileSource | FileSystemFileSource | BlobFileSource;

export interface EditorState {
    scene: Scene;
    currentStep: number;
}

function getCurrentStep(state: EditorState): SceneStep {
    const step = state.scene.steps[state.currentStep];
    if (!step) {
        throw new Error(`Invalid step index ${state.currentStep}`);
    }
    return step;
}

const HISTORY_SIZE = 1000;

const SourceContext = createContext<[FileSource | undefined, Dispatch<SetStateAction<FileSource | undefined>>]>([
    undefined,
    () => {},
]);

const { UndoProvider, Context, usePresent, useUndoRedo, useUndoRedoPossible, useReset } = createUndoContext(
    sceneReducer,
    HISTORY_SIZE,
);

export interface SceneProviderProps extends PropsWithChildren {
    initialScene?: Scene;
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ initialScene, children }) => {
    const source = useState<FileSource | undefined>();

    const initialState: EditorState = useMemo(
        () => ({
            scene: initialScene ?? DEFAULT_SCENE,
            currentStep: 0,
        }),
        [initialScene],
    );

    return (
        <SourceContext.Provider value={source}>
            <UndoProvider initialState={initialState}>{children}</UndoProvider>
        </SourceContext.Provider>
    );
};

export const SceneContext = Context;

export interface SceneContext {
    scene: Scene;
    step: SceneStep;
    stepIndex: number;
    source?: FileSource;
    dispatch: React.Dispatch<SceneAction>;
}

export function useScene(): SceneContext {
    const [present, dispatch] = usePresent();
    const [source] = useContext(SourceContext);

    return {
        scene: present.scene,
        step: getCurrentStep(present),
        stepIndex: present.currentStep,
        source: source,
        dispatch,
    };
}

export function useCurrentStep(): SceneStep {
    const [present] = usePresent();
    return getCurrentStep(present);
}

export const useSceneUndoRedo = useUndoRedo;
export const useSceneUndoRedoPossible = useUndoRedoPossible;

export function useLoadScene(): (scene: Scene, source?: FileSource) => void {
    const reset = useReset();
    const setSavedState = useSetSavedState();
    const [, setSource] = useContext(SourceContext);

    return React.useCallback(
        (scene: Scene, source?: FileSource) => {
            reset({ scene, currentStep: 0 });
            setSavedState(scene);
            setSource(source);
        },
        [reset, setSavedState, setSource],
    );
}

export function useSetSource(): Dispatch<SetStateAction<FileSource | undefined>> {
    const [, setSource] = useContext(SourceContext);
    return setSource;
}

export function getObjectById(scene: Scene, id: number): SceneObject | undefined {
    for (const step of scene.steps) {
        const object = step.objects.find((o) => o.id === id);
        if (object) {
            return object;
        }
    }

    return undefined;
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

function assignObjectIds(
    scene: Readonly<Scene>,
    objects: readonly SceneObjectWithoutId[],
): { objects: SceneObject[]; nextId: number } {
    let nextId = scene.nextId;

    const newObjects = objects
        .map((obj) => {
            if (obj.id !== undefined) {
                return obj as SceneObject;
            }
            return { ...obj, id: nextId++ };
        })
        .filter((obj) => {
            if (objects.some((existing) => existing.id === obj.id)) {
                console.error(`Cannot create new object with already-used ID ${obj.id}`);
                return false;
            }
            return true;
        });

    return {
        objects: newObjects,
        nextId,
    };
}

function setStep(state: Readonly<EditorState>, index: number): EditorState {
    if (index === state.currentStep) {
        return state;
    }
    return {
        ...state,
        currentStep: clamp(index, 0, state.scene.steps.length - 1),
    };
}

function addStep(state: Readonly<EditorState>, after: number): EditorState {
    const copy = copyObjects(state.scene, getCurrentStep(state).objects);
    const { objects, nextId } = assignObjectIds(state.scene, copy);

    const newStep: SceneStep = { objects };

    const steps = state.scene.steps.slice();
    steps.splice(after + 1, 0, newStep);

    return {
        ...state,
        scene: { ...state.scene, nextId, steps },
        currentStep: after + 1,
    };
}

function removeStep(state: Readonly<EditorState>, index: number): EditorState {
    const newSteps = state.scene.steps.slice();
    newSteps.splice(index, 1);

    if (newSteps.length === 0) {
        newSteps.push({ objects: [] });
    }

    let currentStep = state.currentStep;
    if (index === currentStep) {
        currentStep--;
    }
    currentStep = clamp(currentStep, 0, newSteps.length - 1);

    return {
        ...state,
        scene: {
            ...state.scene,
            steps: newSteps,
        },
        currentStep,
    };
}

function reoderSteps(state: Readonly<EditorState>, order: number[]): EditorState {
    const newSteps = order.map((index) => state.scene.steps[index]).filter((step) => step !== undefined);

    return {
        ...state,
        scene: {
            ...state.scene,
            steps: newSteps,
        },
    };
}

function updateStep(scene: Readonly<Scene>, index: number, step: SceneStep): Scene {
    const result: Scene = {
        nextId: scene.nextId,
        arena: scene.arena,
        steps: [...scene.steps],
    };
    result.steps[index] = step;
    return result;
}

function updateCurrentStep(state: Readonly<EditorState>, step: SceneStep): EditorState {
    return {
        ...state,
        scene: updateStep(state.scene, state.currentStep, step),
    };
}

function addObjects(
    state: Readonly<EditorState>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
): EditorState {
    const currentStep = getCurrentStep(state);

    const { objects: addedObjects, nextId } = assignObjectIds(state.scene, asArray(objects));

    const newObjects = [...currentStep.objects];

    for (const object of addedObjects) {
        if (isTether(object)) {
            newObjects.splice(getTetherIndex(newObjects, object), 0, object);
        } else {
            newObjects.push(object);
        }
    }

    return {
        ...state,
        scene: {
            ...updateStep(state.scene, state.currentStep, { objects: newObjects }),
            nextId,
        },
    };
}

function removeObjects(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);

    const objects = currentStep.objects.filter((object) => {
        if (ids.includes(object.id)) {
            return false;
        }

        if (isTether(object)) {
            // Delete any tether that is tethered to a deleted object.
            return !ids.includes(object.startId) && !ids.includes(object.endId);
        }

        return true;
    });

    return updateCurrentStep(state, { objects });
}

function moveObject(state: Readonly<EditorState>, from: number, to: number): EditorState {
    if (from === to) {
        return state;
    }

    const currentStep = getCurrentStep(state);

    const objects = currentStep.objects.slice();
    const items = objects.splice(from, 1);
    objects.splice(to, 0, ...items);

    return updateCurrentStep(state, { objects });
}

function mapSelected(step: Readonly<SceneStep>, ids: readonly number[]) {
    return step.objects.map((object) => ({ object, selected: ids.includes(object.id) }));
}

function unmapSelected(objects: { object: SceneObject; selected: boolean }[]): SceneStep {
    return {
        objects: objects.map((o) => o.object),
    };
}

function moveGroupUp(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    for (let i = objects.length - 1; i > 0; i--) {
        const current = objects[i];
        const next = objects[i - 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i - 1] = current;
        }
    }

    return updateCurrentStep(state, unmapSelected(objects));
}

function moveGroupDown(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    for (let i = 0; i < objects.length - 1; i++) {
        const current = objects[i];
        const next = objects[i + 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i + 1] = current;
        }
    }

    return updateCurrentStep(state, unmapSelected(objects));
}

function moveGroupToTop(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (a.selected ? 1 : 0) - (b.selected ? 1 : 0);
    });

    return updateCurrentStep(state, unmapSelected(objects));
}

function moveGroupToBottom(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (b.selected ? 1 : 0) - (a.selected ? 1 : 0);
    });

    return updateCurrentStep(state, unmapSelected(objects));
}

function updateObjects(state: Readonly<EditorState>, values: readonly SceneObject[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = currentStep.objects.slice();

    for (const update of asArray(values)) {
        const index = objects.findIndex((o) => o.id === update.id);
        if (index >= 0) {
            objects[index] = update;
        }
    }

    return updateCurrentStep(state, { objects });
}

function updateArena(state: Readonly<EditorState>, arena: Arena): EditorState {
    return {
        scene: { ...state.scene, arena },
        currentStep: state.currentStep,
    };
}

function sceneReducer(state: Readonly<EditorState>, action: SceneAction): EditorState {
    switch (action.type) {
        case 'setStep':
            return setStep(state, action.index);

        case 'nextStep':
            if (state.currentStep === state.scene.steps.length - 1) {
                return state;
            }
            return setStep(state, state.currentStep + 1);

        case 'previousStep':
            if (state.currentStep === 0) {
                return state;
            }
            return setStep(state, state.currentStep - 1);

        case 'addStep':
            return addStep(state, action.after ?? state.currentStep);

        case 'removeStep':
            return removeStep(state, action.index);

        case 'reoderSteps':
            return reoderSteps(state, action.order);

        case 'arena':
            return updateArena(state, action.value);

        case 'arenaShape':
            return updateArena(state, { ...state.scene.arena, shape: action.value });

        case 'arenaWidth':
            return updateArena(state, { ...state.scene.arena, width: action.value });

        case 'arenaHeight':
            return updateArena(state, { ...state.scene.arena, height: action.value });

        case 'arenaPadding':
            return updateArena(state, { ...state.scene.arena, padding: action.value });

        case 'arenaGrid':
            return updateArena(state, { ...state.scene.arena, grid: action.value });

        case 'arenaTicks':
            return updateArena(state, { ...state.scene.arena, ticks: action.value });

        case 'arenaBackground':
            return updateArena(state, { ...state.scene.arena, backgroundImage: action.value });

        case 'arenaBackgroundOpacity':
            return updateArena(state, { ...state.scene.arena, backgroundOpacity: action.value });

        case 'add':
            return addObjects(state, action.object);

        case 'remove':
            return removeObjects(state, asArray(action.ids));

        case 'move':
            return moveObject(state, action.from, action.to);

        case 'moveUp':
            return moveGroupUp(state, asArray(action.ids));

        case 'moveDown':
            return moveGroupDown(state, asArray(action.ids));

        case 'moveToTop':
            return moveGroupToTop(state, asArray(action.ids));

        case 'moveToBottom':
            return moveGroupToBottom(state, asArray(action.ids));

        case 'update':
            return updateObjects(state, asArray(action.value));
    }

    return state;
}
