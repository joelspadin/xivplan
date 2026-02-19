/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import {
    DefaultAttachPosition,
    getDefaultAttachmentSettings,
    getObjectToAttachToAt,
    getRelativeAttachmentPoint,
} from './connections';
import { getAbsolutePosition, getAbsoluteRotation } from './coord';
import { copyObjects } from './copy';
import {
    Arena,
    ArenaShape,
    DEFAULT_SCENE,
    Grid,
    isMoveable,
    isRotateable,
    isTether,
    MoveableObject,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    SceneStep,
    Tether,
    Ticks,
} from './scene';
import { createUndoContext } from './undo/undoContext';
import { StateActionBase, UndoRedoAction } from './undo/undoReducer';
import { useSetSavedState } from './useIsDirty';
import { asArray, clamp, omit } from './util';

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

export type SceneAction = (ArenaAction | ObjectAction | StepAction | SetSourceAction) & StateActionBase;

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

const { UndoProvider, Context, usePresent, useUndoRedoPossible } = createUndoContext(sceneReducer, HISTORY_SIZE);

export interface SceneProviderProps extends PropsWithChildren {
    initialScene?: Scene;
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ initialScene, children }) => {
    const source = useState<FileSource | undefined>();

    const initialState: EditorState = {
        scene: initialScene ?? DEFAULT_SCENE,
        currentStep: 0,
    };

    return (
        <SourceContext value={source}>
            <UndoProvider initialState={initialState}>{children}</UndoProvider>
        </SourceContext>
    );
};

export const SceneContext = Context;

export interface SceneContext {
    scene: Scene;
    step: SceneStep;
    stepIndex: number;
    source?: FileSource;
    dispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>;

    /** The latest scene prior to any transient updates. */
    canonicalScene: Scene;
}

export function useScene(): SceneContext {
    const [transientPresent, present, dispatch] = usePresent();
    const [source] = useContext(SourceContext);

    return {
        scene: transientPresent.scene,
        canonicalScene: present.scene,
        step: getCurrentStep(transientPresent),
        stepIndex: transientPresent.currentStep,
        source: source,
        dispatch,
    };
}

export function useCurrentStep(): SceneStep {
    const [present] = usePresent();
    return getCurrentStep(present);
}

export const useSceneUndoRedoPossible = useUndoRedoPossible;

export function useLoadScene(): (scene: Scene, source?: FileSource) => void {
    const { dispatch } = useScene();
    const setSavedState = useSetSavedState();
    const [, setSource] = useContext(SourceContext);

    return (scene: Scene, source?: FileSource) => {
        dispatch({ type: 'reset', state: { scene, currentStep: 0 } });
        setSavedState(scene);
        setSource(source);
    };
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

/** @returns the list of objects that have the given object as direct position parent. */
export function getDirectPositionDescendants(scene: Scene, object: SceneObject): (SceneObject & MoveableObject)[] {
    const children: (SceneObject & MoveableObject)[] = [];
    for (const step of scene.steps) {
        step.objects.forEach((obj) => {
            if (isMoveable(obj) && obj.positionParentId === object.id) {
                children.push(obj);
            }
        });
    }
    return children;
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
    existingObjects: readonly SceneObject[],
): { objects: SceneObject[]; nextId: number } {
    let nextId = scene.nextId;
    let objectsWithExistingId = 0;
    let objectsWithoutId = 0;

    const newObjects = objects
        .map((obj) => {
            if (obj.id !== undefined) {
                nextId = Math.max(nextId, obj.id + 1);
                objectsWithExistingId++;
                return obj as SceneObject;
            }
            objectsWithoutId++;
            return { ...obj, id: nextId++ };
        })
        .filter((obj) => {
            if (existingObjects.some((existing) => existing.id === obj.id)) {
                console.error(`Cannot create new object with already-used ID ${obj.id}`);
                return false;
            }
            return true;
        });
    // This has some potential nextId corruption issues, so disallow having a mix of input types.
    // In practice either all or none of the objects will have ids already, where the 'all' case uses
    // this function to prevent duplicate IDs.
    if (objectsWithExistingId && objectsWithoutId) {
        console.error(
            `Cannot add items both with ID and without ID at the same time. Received ${objectsWithExistingId} with ID, and ${objectsWithoutId} without`,
        );
        return { objects: [], nextId: scene.nextId };
    }

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
    const { objects, nextId } = copyObjects(state.scene, getCurrentStep(state).objects);

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

    const { objects: addedObjects, nextId } = assignObjectIds(
        state.scene,
        asArray(objects),
        state.scene.steps.flatMap((step) => step.objects),
    );

    const newObjects = [...currentStep.objects];

    if (addedObjects.length == 1 && isMoveable(addedObjects[0])) {
        const attachmentSettings = getDefaultAttachmentSettings(addedObjects[0]);
        if (attachmentSettings.location != DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT) {
            const potentialParent = getObjectToAttachToAt(state.scene, currentStep, addedObjects[0]);
            if (isMoveable(potentialParent)) {
                // TODO: don't attach by default if it'll put the attachment off-screen?
                addedObjects[0] = {
                    ...addedObjects[0],
                    ...getRelativeAttachmentPoint(
                        state.scene,
                        addedObjects[0],
                        potentialParent,
                        attachmentSettings.location,
                    ),
                    positionParentId: potentialParent.id,
                    pinned: attachmentSettings.pinByDefault,
                } as SceneObject & MoveableObject;
            }
        }
    }

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

    // Also delete any object with the to-be-deleted objects as parent
    const idsToDelete = new Set(ids);
    let idsAdded = idsToDelete.size;
    while (idsAdded > 0) {
        idsAdded = 0;
        currentStep.objects.forEach((obj) => {
            if (idsToDelete.has(obj.id)) {
                return;
            }
            if (
                isMoveable(obj) &&
                obj.positionParentId !== undefined &&
                idsToDelete.has(obj.positionParentId) &&
                // Automatically delete positionally-attached objects that would attach automatically as well
                getDefaultAttachmentSettings(obj).location != DefaultAttachPosition.DONT_ATTACH_BY_DEFAULT
            ) {
                idsToDelete.add(obj.id);
                idsAdded++;
            }
            if (isTether(obj) && (idsToDelete.has(obj.startId) || idsToDelete.has(obj.endId))) {
                idsToDelete.add(obj.id);
                idsAdded++;
            }
        });
    }

    const objects = currentStep.objects
        .filter((object) => !idsToDelete.has(object.id))
        .map((obj) =>
            // Stabilize the rotation of any object that was facing a to-be-deleted object
            isRotateable(obj) && obj.facingId !== undefined && idsToDelete.has(obj.facingId)
                ? {
                      ...omit(obj, 'facingId'),
                      rotation: isMoveable(obj) ? getAbsoluteRotation(state.scene, obj) : 0,
                  }
                : obj,
        )
        .map((obj) =>
            // Stabilize the position of any object still linked to a to-be-deleted object
            isMoveable(obj) && obj.positionParentId !== undefined && idsToDelete.has(obj.positionParentId)
                ? {
                      ...omit(obj, 'positionParentId'),
                      ...getAbsolutePosition(state.scene, obj),
                      // Always unpin objects upon detaching them
                      pinned: false,
                  }
                : obj,
        );

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
