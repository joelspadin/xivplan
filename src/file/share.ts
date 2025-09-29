import { use, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { jsonToScene, sceneToText, textToScene } from '../file';
import { Scene } from '../scene';

export function getShareLink(scene: Scene): string {
    const data = sceneToText(scene);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${data}`;
}

const PLAN_PREFIX = '#/plan/';

function getPlanData(hash: string, searchParams?: URLSearchParams): string | undefined {
    // Current share links are formatted as /#/plan/<data>
    if (hash.startsWith(PLAN_PREFIX)) {
        return decodeURIComponent(hash.substring(PLAN_PREFIX.length));
    }

    // Previously, links were formatted as /?path=<data>
    const data = searchParams?.get('plan');
    if (data) {
        return data;
    }

    return undefined;
}

export function parseSceneLink(url: URL): Scene | undefined;
export function parseSceneLink(hash: string, searchParams: URLSearchParams): Scene | undefined;
export function parseSceneLink(hash: string | URL, searchParams?: URLSearchParams): Scene | undefined {
    if (hash instanceof URL) {
        return parseSceneLink(hash.hash, hash.searchParams);
    }

    const data = getPlanData(hash, searchParams);
    if (data) {
        return textToScene(data);
    }

    return undefined;
}

export async function fetchScene(url: string) {
    const response = await fetch(url);
    const data = await response.text();

    return jsonToScene(data);
}

let urlCache = '';
let scenePromise: Promise<Scene | undefined> | undefined;
let sceneError: Error | string | unknown | undefined;

function getFetchScenePromise(url: string): Promise<Scene | undefined> {
    if (url === urlCache && scenePromise) {
        return scenePromise;
    }

    urlCache = url;
    scenePromise = fetchScene(url).catch((ex) => {
        console.error(`Failed to read plan from "${url}"`, ex);
        sceneError = ex;

        return undefined;
    });

    return scenePromise;
}

/**
 * Reads a plan's scene data from the URL. If this requires fetching data from an external site, it suspends until the
 * data is fetched.
 */
export function useSceneFromUrl(): Scene | undefined {
    const [searchParams] = useSearchParams();
    const { hash } = useLocation();

    let scene: Scene | undefined;
    let error: unknown | undefined;

    try {
        scene = parseSceneLink(hash, searchParams);
    } catch (ex) {
        console.error('Invalid plan data from URL', ex);
        error = ex;
    }

    useEffect(() => {
        sceneError = error;
    }, [error]);

    if (scene) {
        return scene;
    }

    const url = searchParams.get('url');
    if (url) {
        return use(getFetchScenePromise(url));
    }

    return undefined;
}

export function useSceneLoadError(): Error | string | unknown | undefined {
    return sceneError;
}
