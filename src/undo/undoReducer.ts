import React from 'react';

export interface UndoRedoState<S> {
    past: S[];
    present: S;
    future: S[];
}

enum ActionTypes {
    Undo = 'undo',
    Redo = 'redo',
    Reset = 'reset',
}

export type UndoAction = {
    type: ActionTypes.Undo;
};

export type RedoAction = {
    type: ActionTypes.Redo;
};

export type ResetAction<S> = {
    type: ActionTypes.Reset;
    state: S;
};

export type UndoRedoAction<S> = UndoAction | RedoAction | ResetAction<S>;

export type UndoRedoReducer<S, A> = React.Reducer<UndoRedoState<S>, A | UndoRedoAction<S>>;

export function createUndoReducer<S, A extends object>(
    reducer: React.Reducer<S, A>,
    historyLimit = Infinity,
): UndoRedoReducer<S, A | UndoRedoAction<S>> {
    return (state, action) => {
        if ('type' in action) {
            if (action.type === ActionTypes.Undo) {
                const [present, ...past] = state.past;

                if (present === undefined) {
                    return state;
                }

                return {
                    past,
                    present,
                    future: [state.present, ...state.future],
                };
            }

            if (action.type === ActionTypes.Redo) {
                const [present, ...future] = state.future;

                if (present === undefined) {
                    return state;
                }

                return {
                    past: [state.present, ...state.past],
                    present,
                    future,
                };
            }

            if (action.type === ActionTypes.Reset) {
                return {
                    past: [],
                    present: action.state,
                    future: [],
                };
            }
        }

        return {
            past: [state.present, ...state.past].slice(0, historyLimit),
            present: reducer(state.present, action),
            future: [],
        };
    };
}

export function undoAction(): UndoAction {
    return { type: ActionTypes.Undo };
}

export function redoAction(): RedoAction {
    return { type: ActionTypes.Redo };
}

export function resetAction<S>(state: S): ResetAction<S> {
    return { type: ActionTypes.Reset, state };
}
