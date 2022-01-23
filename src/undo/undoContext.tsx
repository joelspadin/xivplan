import React, { ComponentType, createContext, Dispatch, useCallback, useContext, useReducer } from 'react';
import { createUndoReducer, redoAction, undoAction, UndoRedoAction, UndoRedoState } from './undoReducer';

export interface UndoProviderProps<S> {
    initialState: S;
}

export type UndoRedoFunc = {
    (): void;
    isPossible: boolean;
};

export type UndoContext<S, A> = [state: UndoRedoState<S>, dispatch: Dispatch<A | UndoRedoAction>];

export function createUndoContext<S, A>(
    reducer: React.Reducer<S, A>,
    historyLimit = Infinity,
): {
    UndoProvider: ComponentType<UndoProviderProps<S>>;
    Context: React.Context<UndoContext<S | undefined, A>>;
    usePresent: () => [state: S, dispatch: Dispatch<A>];
    useUndoRedo: () => [undo: UndoRedoFunc, redo: UndoRedoFunc];
} {
    const Context = createContext<UndoContext<S | undefined, A>>([
        {
            past: [],
            present: undefined,
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
            future: [],
        });

        return <Context.Provider value={value}>{children}</Context.Provider>;
    };

    function usePresent(): [state: S, dispatch: Dispatch<A>] {
        const [state, dispatch] = useContext(Context);

        if (state.present === undefined) {
            throw new Error('usePresent() called outside of UndoProvider');
        }

        return [state.present, dispatch];
    }

    function useUndoRedo(): [undo: UndoRedoFunc, redo: UndoRedoFunc] {
        const [state, dispatch] = useContext(Context);

        const undo = useCallback(() => dispatch(undoAction()), [dispatch]) as UndoRedoFunc;
        undo.isPossible = state.past.length > 0;

        const redo = useCallback(() => dispatch(redoAction()), [dispatch]) as UndoRedoFunc;
        redo.isPossible = state.future.length > 0;

        return [undo, redo];
    }

    return { UndoProvider, Context, usePresent, useUndoRedo };
}
