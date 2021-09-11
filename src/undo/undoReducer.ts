import React from 'react';

export interface UndoRedoState<S> {
    past: S[];
    present: S;
    future: S[];
}

enum ActionTypes {
    Undo = 'undo',
    Redo = 'redo',
}

export type UndoAction = {
    type: ActionTypes.Undo;
};

export type RedoAction = {
    type: ActionTypes.Redo;
};

export type UndoRedoAction = UndoAction | RedoAction;

export type UndoRedoReducer<S, A> = React.Reducer<UndoRedoState<S>, A | UndoRedoAction>;

export function createUndoReducer<S, A>(reducer: React.Reducer<S, A>, historyLimit = Infinity): UndoRedoReducer<S, A> {
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
