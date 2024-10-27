import { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { ObjectLoadingContext, ObjectLoadingState } from './ObjectLoadingContext';

/**
 * Tracks whether any descendants using useObjectLoading()
 */
export const ObjectLoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const objects = useRef(new Set<string>());
    const [isLoading, setIsLoading] = useState(false);

    const updateIsLoading = useCallback(() => {
        setIsLoading(objects.current.size > 0);
    }, [objects, setIsLoading]);

    const setLoading = useCallback(
        (id: string) => {
            objects.current.add(id);
            updateIsLoading();
        },
        [objects, updateIsLoading],
    );

    const clearLoading = useCallback(
        (id: string) => {
            objects.current.delete(id);
            updateIsLoading();
        },
        [objects, updateIsLoading],
    );

    const state: ObjectLoadingState = useMemo(
        () => ({
            isLoading,
            setLoading,
            clearLoading,
        }),
        [isLoading, setLoading, clearLoading],
    );

    return <ObjectLoadingContext.Provider value={state}>{children}</ObjectLoadingContext.Provider>;
};
