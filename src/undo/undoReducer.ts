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

/**
 * All actions which modify the state and are not specific to undo/redo logic
 * should extend this type.
 */
export interface StateActionBase {
    /**
     * When true, this the updated state is not inserted into the undo stack.
     * This allows operations such as dragging an object to repeatedly update
     * the state but only add a single item to the undo stack when finished.
     *
     * Apply a `type: 'commit'` action to commit the latest transient state to
     * the undo stack, or apply a `type: 'rollback'` action to reset it to the
     * previous state before any transient updates.
     */
    transient?: boolean;
}

/**
 * Action which undoes the last state change.
 */
export interface UndoAction {
    type: 'undo';
}

/**
 * Action which undoes an undo.
 */
export interface RedoAction {
    type: 'redo';
}

/**
 * Action which resets the state to the given object and clears all undo/redo history
 */
export interface ResetAction<S> {
    type: 'reset';
    state: S;
}

/**
 * Action which commits the latest transient state to the undo history.
 */
export type CommitAction = {
    type: 'commit';
};

/**
 * Action which resets the transient state to the last non-transient state.
 */
export type RollbackAction = {
    type: 'rollback';
};

export type UndoRedoAction<S> = UndoAction | RedoAction | ResetAction<S> | CommitAction | RollbackAction;

export type UndoRedoReducer<S, A extends StateActionBase> = React.Reducer<UndoRedoState<S>, A | UndoRedoAction<S>>;

export function createUndoReducer<S, A extends StateActionBase>(
    reducer: React.Reducer<S, A>,
    historyLimit: number,
): UndoRedoReducer<S, A> {
    return (state, action) => {
        if ('type' in action) {
            if (action.type === 'undo') {
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

            if (action.type === 'redo') {
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

            if (action.type === 'reset') {
                return {
                    past: [],
                    present: action.state,
                    transientPresent: action.state,
                    future: [],
                };
            }

            if (action.type === 'commit') {
                if (state.transientPresent === state.present) {
                    return state;
                }

                return {
                    past: getNewPast(state, historyLimit),
                    present: state.transientPresent,
                    transientPresent: state.transientPresent,
                    future: [],
                };
            }

            if (action.type === 'rollback') {
                if (state.transientPresent === state.present) {
                    return state;
                }

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
    const result = [state.present, ...state.past];

    if (result.length > historyLimit) {
        return result.slice(0, historyLimit);
    }

    return result;
}
