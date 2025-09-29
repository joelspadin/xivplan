import React, { ComponentType, createContext, Dispatch, PropsWithChildren, use, useReducer } from 'react';
import {
    commitAction,
    createUndoReducer,
    redoAction,
    resetAction,
    rollbackAction,
    StateActionBase,
    undoAction,
    UndoRedoAction,
    UndoRedoState,
} from './undoReducer';

export interface UndoProviderProps<S> extends PropsWithChildren {
    initialState: S;
}

export type StateActionFunc = () => void;

export type UndoContext<S, A> = [state: UndoRedoState<S>, dispatch: Dispatch<A | UndoRedoAction<S>>];

export function createUndoContext<S, A extends StateActionBase>(
    reducer: React.Reducer<S, A>,
    historyLimit = Infinity,
): {
    UndoProvider: ComponentType<UndoProviderProps<S>>;
    Context: React.Context<UndoContext<S, A>>;
    usePresent: () => [state: S, dispatch: Dispatch<A>];
    useCanonicalPresent: () => S;
    useUndoRedo: () => [undo: StateActionFunc, redo: StateActionFunc];
    useUndoRedoPossible: () => [undoPossible: boolean, redoPossible: boolean];
    useReset: () => Dispatch<S>;
    useCommit: () => StateActionFunc;
    useRollback: () => StateActionFunc;
} {
    const Context = createContext<UndoContext<S, A>>([
        {
            past: [],
            present: undefined as unknown as S,
            transientPresent: undefined as unknown as S,
            future: [],
        },
        () => {
            throw new Error('Undo/redo called outside of UndoContext');
        },
    ]);

    const undoReducer = createUndoReducer(reducer, historyLimit);

    const UndoProvider: React.FC<UndoProviderProps<S>> = ({ children, initialState }) => {
        const value = useReducer(undoReducer, {
            past: [],
            present: initialState,
            transientPresent: initialState,
            future: [],
        });

        return <Context value={value}>{children}</Context>;
    };

    function usePresent(): [state: S, dispatch: Dispatch<A>] {
        const [state, dispatch] = use(Context);

        if (state.present === undefined) {
            throw new Error('usePresent() called outside of UndoProvider');
        }

        return [state.transientPresent, dispatch];
    }

    function useCanonicalPresent(): S {
        const [state] = use(Context);

        return state.present;
    }

    function useUndoRedo(): [undo: StateActionFunc, redo: StateActionFunc] {
        const [, dispatch] = use(Context);

        const undo = () => dispatch(undoAction);
        const redo = () => dispatch(redoAction);

        return [undo, redo];
    }

    function useUndoRedoPossible(): [undoPossible: boolean, redoPossible: boolean] {
        const [state] = use(Context);
        const undoPossible = state.past.length > 0;
        const redoPossible = state.future.length > 0;

        return [undoPossible, redoPossible];
    }

    function useReset(): Dispatch<S> {
        const [, dispatch] = use(Context);

        return (state: S) => dispatch(resetAction(state));
    }

    function useCommit(): StateActionFunc {
        const [, dispatch] = use(Context);
        return () => dispatch(commitAction);
    }

    function useRollback(): StateActionFunc {
        const [, dispatch] = use(Context);
        return () => dispatch(rollbackAction);
    }

    return {
        UndoProvider,
        Context,
        usePresent,
        useCanonicalPresent,
        useUndoRedo,
        useUndoRedoPossible,
        useReset,
        useCommit,
        useRollback,
    };
}
