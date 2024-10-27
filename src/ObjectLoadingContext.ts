import { createContext } from 'react';

export interface ObjectLoadingState {
    isLoading: boolean;
    setLoading: (id: string) => void;
    clearLoading: (id: string) => void;
}

export const ObjectLoadingContext = createContext<ObjectLoadingState>({
    isLoading: false,
    setLoading: () => undefined,
    clearLoading: () => undefined,
});
