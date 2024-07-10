import { useContext, useEffect, useId } from 'react';
import useImage from 'use-image';
import { ObjectLoadingContext } from './ObjectLoadingContext';

/**
 * Delays taking a screenshot until loading == false.
 */
export function useObjectLoading(loading: boolean) {
    const id = useId();
    const { setLoading, clearLoading } = useContext(ObjectLoadingContext);

    useEffect(() => {
        if (loading) {
            setLoading(id);

            return () => {
                clearLoading(id);
            };
        }
    }, [id, loading, setLoading, clearLoading]);
}

type UseImageType = typeof useImage;

/**
 * useImage(), but delays taking a screenshot until the image finishes loading,
 * and crossOrigin defaults to "anonymous" to avoid tainting the canvas.
 */
export const useImageTracked: UseImageType = (url, crossOrigin = 'anonymous', referrerPolicy = undefined) => {
    const [image, status] = useImage(url, crossOrigin, referrerPolicy);

    useObjectLoading(!!url && status === 'loading');

    return [image, status];
};
