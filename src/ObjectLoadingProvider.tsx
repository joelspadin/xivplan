import { PropsWithChildren, useRef, useState } from 'react';
import { ObjectLoadingContext, ObjectLoadingState } from './ObjectLoadingContext';

/**
 * Tracks whether any descendants using useObjectLoading()
 */
export const ObjectLoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const objects = useRef(new Set<string>());
    const [isLoading, setIsLoading] = useState(false);

    const updateIsLoading = () => {
        setIsLoading(objects.current.size > 0);
    };

    const setLoading = (id: string) => {
        objects.current.add(id);
        updateIsLoading();
    };

    const clearLoading = (id: string) => {
        objects.current.delete(id);
        updateIsLoading();
    };

    const state: ObjectLoadingState = {
        isLoading,
        setLoading,
        clearLoading,
    };

    return <ObjectLoadingContext value={state}>{children}</ObjectLoadingContext>;
};
