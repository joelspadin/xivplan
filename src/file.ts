import { openFileLocal, saveFileLocal } from './file/localFile';
import { Scene } from './scene';
import { FileSource } from './SceneProvider';

export async function saveFile(scene: Readonly<Scene>, source: FileSource): Promise<void> {
    switch (source.type) {
        case 'local':
            await saveFileLocal(scene, source.name);
    }
}

export async function openFile(source: FileSource): Promise<Scene> {
    switch (source.type) {
        case 'local':
            return await openFileLocal(source.name);
    }
}

export function sceneToJson(scene: Readonly<Scene>): string {
    return JSON.stringify(scene, undefined, 2);
}

export function jsonToScene(json: string): Scene {
    const scene = JSON.parse(json);
    validateScene(scene);

    return scene;
}

function validateScene(obj: unknown): asserts obj is Scene {
    if (typeof obj !== 'object') {
        throw new Error('Expected an object');
    }

    // TODO: try to check that this is valid data
}
