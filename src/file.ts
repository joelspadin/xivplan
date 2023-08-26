import { Base64 } from 'js-base64';
import { deflate, inflate } from 'pako';

import { FileSource, LocalFileSource } from './SceneProvider';
import { openFileLocal, saveFileLocal } from './file/localFile';
import { upgradeScene } from './file/upgrade';
import { Scene } from './scene';

export async function saveFile(scene: Readonly<Scene>, source: FileSource): Promise<void> {
    switch (source.type) {
        case 'local':
            await saveFileLocal(scene, source.name);
    }
}

export async function openFile(source: FileSource): Promise<Scene> {
    const scene = await openFileUnvalidated(source);
    return upgradeScene(scene);
}

async function openFileUnvalidated(source: LocalFileSource) {
    switch (source.type) {
        case 'local':
            return await openFileLocal(source.name);
    }
}

export function sceneToText(scene: Readonly<Scene>): string {
    const compressed = deflate(sceneToJson(scene));

    return Base64.fromUint8Array(compressed, true);
}

export function textToScene(data: string): Scene {
    const decompressed = inflate(Base64.toUint8Array(data));

    return jsonToScene(new TextDecoder().decode(decompressed));
}

export function sceneToJson(scene: Readonly<Scene>): string {
    return JSON.stringify(scene, undefined, 2);
}

export function jsonToScene(json: string): Scene {
    const scene = upgradeScene(JSON.parse(json));

    validateScene(scene);
    return scene;
}

function validateScene(obj: unknown): asserts obj is Scene {
    if (typeof obj !== 'object') {
        throw new Error('Expected an object');
    }

    // TODO: try to check that this is valid data
}
