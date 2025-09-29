import React from 'react';

export interface UndoRedoState<S> {
    /** Stack of previous states that we can undo to */
    past: S[];
    /** Current, canonical state */
    present: S;
    /** Current, transient state */
    transientPresent: S;
    /** Stack of future states that we can redo to */
    future: S[];
}

enum ActionTypes {
    Undo = 'undo',
    Redo = 'redo',
    Reset = 'reset',

    Commit = 'commit',
    Rollback = 'rollback',
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

export type CommitAction = {
    type: ActionTypes.Commit;
};

export type RollbackAction = {
    type: ActionTypes.Rollback;
};

export type StateActionBase = {
    /**
     * When true, this the updated state is not inserted into the undo stack.
     * This allows operations such as dragging an object to repeatedly update
     * the state but only add a single item to the undo stack when finished.
     *
     * Apply a `commitAction` to commit the latest transient state to the undo
     * stack, or apply a `rollbackAction` to reset it to the previous state
     * before any transient updates.
     */
    transient?: boolean;
};

export type UndoRedoAction<S> = UndoAction | RedoAction | ResetAction<S> | CommitAction | RollbackAction;

export type UndoRedoReducer<S, A extends StateActionBase> = React.Reducer<UndoRedoState<S>, A | UndoRedoAction<S>>;

export function createUndoReducer<S, A extends StateActionBase>(
    reducer: React.Reducer<S, A>,
    historyLimit = Infinity,
): UndoRedoReducer<S, A> {
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
                    transientPresent: present,
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
                    transientPresent: present,
                    future,
                };
            }

            if (action.type === ActionTypes.Reset) {
                return {
                    past: [],
                    present: action.state,
                    transientPresent: action.state,
                    future: [],
                };
            }

            if (action.type === ActionTypes.Commit) {
                return {
                    past: getNewPast(state, historyLimit),
                    present: state.transientPresent,
                    transientPresent: state.transientPresent,
                    future: [],
                };
            }

            if (action.type === ActionTypes.Rollback) {
                return {
                    ...state,
                    transientPresent: state.present,
                };
            }
        }

        if ('transient' in action && action.transient) {
            return {
                ...state,
                transientPresent: reducer(state.transientPresent, action),
            };
        }

        const newPresent = reducer(state.transientPresent, action);

        return {
            past: getNewPast(state, historyLimit),
            present: newPresent,
            transientPresent: newPresent,
            future: [],
        };
    };
}

function getNewPast<S>(state: UndoRedoState<S>, historyLimit: number) {
    return [state.present, ...state.past].slice(0, historyLimit);
}

export const undoAction: Readonly<UndoAction> = { type: ActionTypes.Undo };
export const redoAction: Readonly<RedoAction> = { type: ActionTypes.Redo };
export const commitAction: Readonly<CommitAction> = { type: ActionTypes.Commit };
export const rollbackAction: Readonly<RollbackAction> = { type: ActionTypes.Rollback };

export function resetAction<S>(state: S): ResetAction<S> {
    return { type: ActionTypes.Reset, state };
}
