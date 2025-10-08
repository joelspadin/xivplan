import React, { ComponentType, createContext, Dispatch, PropsWithChildren, use, useReducer } from 'react';
import { createUndoReducer, StateActionBase, UndoRedoAction, UndoRedoState } from './undoReducer';

export interface UndoProviderProps<S> extends PropsWithChildren {
    initialState: S;
}

export type StateActionFunc = () => void;

export type UndoContext<S, A> = [state: UndoRedoState<S>, dispatch: Dispatch<A | UndoRedoAction<S>>];

export function createUndoContext<S, A extends StateActionBase>(
    reducer: React.Reducer<S, A>,
    historyLimit: number,
): {
    UndoProvider: ComponentType<UndoProviderProps<S>>;
    Context: React.Context<UndoContext<S, A>>;
    usePresent: () => [transientPresent: S, present: S, dispatch: Dispatch<A | UndoRedoAction<S>>];
    useUndoRedoPossible: () => [undoPossible: boolean, redoPossible: boolean];
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

    function usePresent(): [transientPresent: S, present: S, dispatch: Dispatch<A | UndoRedoAction<S>>] {
        const [state, dispatch] = use(Context);

        if (state.present === undefined) {
            throw new Error('usePresent() called outside of UndoProvider');
        }

        return [state.transientPresent, state.present, dispatch];
    }

    function useUndoRedoPossible(): [undoPossible: boolean, redoPossible: boolean] {
        const [state] = use(Context);
        const undoPossible = state.past.length > 0;
        const redoPossible = state.future.length > 0;

        return [undoPossible, redoPossible];
    }

    return {
        UndoProvider,
        Context,
        usePresent,
        useUndoRedoPossible,
    };
}
