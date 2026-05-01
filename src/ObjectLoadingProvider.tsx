import { type PropsWithChildren, useRef, useState } from 'react';
import { ObjectLoadingContext, type ObjectLoadingState } from './ObjectLoadingContext';

/**
 * Tracks whether any descendants using useObjectLoading()
 */
export const ObjectLoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const objectsRef = useRef(new Set<string>());
    const [isLoading, setIsLoading] = useState(false);

    const updateIsLoading = () => {
        setIsLoading(objectsRef.current.size > 0);
    };

    const setLoading = (id: string) => {
        objectsRef.current.add(id);
        updateIsLoading();
    };

    const clearLoading = (id: string) => {
        objectsRef.current.delete(id);
        updateIsLoading();
    };

    const state: ObjectLoadingState = {
        isLoading,
        setLoading,
        clearLoading,
    };

    return <ObjectLoadingContext value={state}>{children}</ObjectLoadingContext>;
};
