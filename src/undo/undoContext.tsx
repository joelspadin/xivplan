import React, {
    ComponentType,
    createContext,
    Dispatch,
    PropsWithChildren,
    useCallback,
    useContext,
    useReducer,
} from 'react';
import { createUndoReducer, redoAction, resetAction, undoAction, UndoRedoAction, UndoRedoState } from './undoReducer';

export interface UndoProviderProps<S> extends PropsWithChildren {
    initialState: S;
}

export type UndoRedoFunc = () => void;

export type UndoContext<S, A> = [state: UndoRedoState<S>, dispatch: Dispatch<A | UndoRedoAction<S>>];

export function createUndoContext<S, A extends object>(
    reducer: React.Reducer<S, A>,
    historyLimit = Infinity,
): {
    UndoProvider: ComponentType<UndoProviderProps<S>>;
    Context: React.Context<UndoContext<S, A>>;
    usePresent: () => [state: S, dispatch: Dispatch<A>];
    useUndoRedo: () => [undo: UndoRedoFunc, redo: UndoRedoFunc];
    useUndoRedoPossible: () => [undoPossible: boolean, redoPossible: boolean];
    useReset: () => Dispatch<S>;
} {
    const Context = createContext<UndoContext<S, A>>([
        {
            past: [],
            present: undefined as unknown as S,
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

        return <Context value={value}>{children}</Context>;
    };

    function usePresent(): [state: S, dispatch: Dispatch<A>] {
        const [state, dispatch] = useContext(Context);

        if (state.present === undefined) {
            throw new Error('usePresent() called outside of UndoProvider');
        }

        return [state.present, dispatch];
    }

    function useUndoRedo(): [undo: UndoRedoFunc, redo: UndoRedoFunc] {
        const [, dispatch] = useContext(Context);

        const undo = useCallback(() => dispatch(undoAction()), [dispatch]) as UndoRedoFunc;
        const redo = useCallback(() => dispatch(redoAction()), [dispatch]) as UndoRedoFunc;

        return [undo, redo];
    }

    function useUndoRedoPossible(): [undoPossible: boolean, redoPossible: boolean] {
        const [state] = useContext(Context);
        const undoPossible = state.past.length > 0;
        const redoPossible = state.future.length > 0;

        return [undoPossible, redoPossible];
    }

    function useReset(): Dispatch<S> {
        const [, dispatch] = useContext(Context);

        return useCallback((state: S) => dispatch(resetAction(state)), [dispatch]);
    }

    return { UndoProvider, Context, usePresent, useUndoRedo, useUndoRedoPossible, useReset };
}
