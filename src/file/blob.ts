import { BlobFileSource } from '../SceneProvider';
import { Scene } from '../scene';

const DEFAULT_FILENAME = 'plan.xivplan';

export function getBlobSource(file: File): BlobFileSource;
export function getBlobSource(name?: string | undefined): BlobFileSource;
export function getBlobSource(file: File | string | undefined): BlobFileSource {
    file = file ?? DEFAULT_FILENAME;

    if (typeof file === 'string') {
        return { type: 'blob', name: file };
    }

    return {
        type: 'blob',
        file,
        get name() {
            return file.name;
        },
    };
}

export function downloadScene(scene: Readonly<Scene>, name: string | undefined) {
    name = name ?? DEFAULT_FILENAME;

    if (!name.endsWith('.xivplan')) {
        name = name + '.xivplan';
    }

    const json = JSON.stringify(scene, undefined, 2);

    const file = new File([json], name, {
        type: 'application/vnd.xivplan.plan+json',
    });

    const url = window.URL.createObjectURL(file);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = name;
    link.click();

    window.URL.revokeObjectURL(url);
}

export async function openFileBlob(file: File): Promise<Scene> {
    const json = await file.text();

    return JSON.parse(json) as Scene;
}
