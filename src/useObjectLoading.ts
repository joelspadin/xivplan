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
 * Module-level cache of fully-loaded HTMLImageElement instances keyed by URL.
 *
 * use-image always initialises its state to { status: 'loading' } before the
 * first onload fires, even when the browser has the image in its HTTP cache.
 * This means every component remount (e.g. step switching changes object IDs,
 * causing full unmount/remount cycles) triggers a one-frame blank before the
 * image reappears — visible as a flicker.
 *
 * By caching the loaded HTMLImageElement we can return it synchronously on the
 * very first render of a remounted component, skipping the loading state entirely.
 */
const loadedImageCache = new Map<string, HTMLImageElement>();

/**
 * useImage(), but:
 * - delays taking a screenshot until the image finishes loading,
 * - crossOrigin defaults to "anonymous" to avoid tainting the canvas, and
 * - returns a previously-loaded image synchronously (no blank-frame flicker on
 *   component remounts caused by step switching).
 */
export const useImageTracked: UseImageType = (url, crossOrigin = 'anonymous', referrerPolicy = undefined) => {
    const [image, status] = useImage(url, crossOrigin, referrerPolicy);

    // Populate the cache as soon as useImage resolves a URL.
    if (image && url) {
        loadedImageCache.set(url, image);
    }

    // If useImage hasn't resolved yet but we loaded this URL before, return the
    // cached element immediately so the component renders without a blank frame.
    const cached = (!image && url) ? loadedImageCache.get(url) : undefined;
    const resolvedImage = image ?? cached;
    const resolvedStatus = resolvedImage ? 'loaded' : status;

    useObjectLoading(!!url && resolvedStatus === 'loading');

    return [resolvedImage, resolvedStatus] as ReturnType<UseImageType>;
};
