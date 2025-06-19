import { useAsync } from 'react-use';
import { useImageTracked, useObjectLoading } from './useObjectLoading';

type Status = 'loaded' | 'loading' | 'failed';

async function getStyledSvg(url: string, style: string) {
    const r = await fetch(url);
    const text = await r.text();

    const styled = text.replace(/(<svg(?:.|\n)*?>)/, `$1<style>${style}</style>`);

    return `data:image/svg+xml;utf8,${encodeURIComponent(styled)}`;
}

/**
 * Like useImageTracked(), but the URL is expected to point to an SVG image, and
 * inserts the given text as a new stylesheet in the SVG image.
 */
export function useStyledSvg(url: string, style = ''): [undefined | HTMLImageElement, Status] {
    const result = useAsync(() => getStyledSvg(url, style), [url, style]);

    useObjectLoading(result.loading);

    return useImageTracked(result.value ?? '');
}
