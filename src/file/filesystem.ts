import { type DBSchema, openDB } from 'idb';
import type { FileSystemFileSource } from '../SceneProvider';
import type { Scene } from '../scene';

const FILE_PICKER_ID = 'plan-file';
const FOLDER_PICKER_ID = 'plan-folder';
const DEFAULT_FOLDER: WellKnownDirectory = 'documents';

export const supportsFs = window.showOpenFilePicker !== undefined && window.showSaveFilePicker !== undefined;

export function getFileSource(handle: FileSystemFileHandle): FileSystemFileSource {
    return {
        type: 'fs',
        handle,
        get name() {
            return handle.name;
        },
    };
}

export async function saveFileFs(scene: Readonly<Scene>, handle: FileSystemFileHandle): Promise<void> {
    const file = await handle.createWritable();
    const json = JSON.stringify(scene, undefined, 2);

    await file.write(json);
    await file.close();
}

export async function openFileFs(handle: FileSystemFileHandle): Promise<Scene> {
    const file = await handle.getFile();
    const json = await file.text();

    return JSON.parse(json) as Scene;
}

function isAbortError(ex: unknown): ex is DOMException {
    return ex instanceof DOMException && ex.name === 'AbortError';
}

async function getFileStartIn() {
    return (await getPlanFolder()) ?? DEFAULT_FOLDER;
}

const filePickerTypes: FilePickerAcceptType[] = [
    {
        accept: { 'application/vnd.xivplan.plan+json': '.xivplan' },
        description: 'XIVPlan Scene',
    },
];

export async function showOpenPlanPicker(): Promise<FileSystemFileHandle | undefined> {
    try {
        const result = await window.showOpenFilePicker({
            id: FILE_PICKER_ID,
            types: filePickerTypes,
            startIn: await getFileStartIn(),
        });
        return result[0];
    } catch (ex) {
        if (isAbortError(ex)) {
            return undefined;
        }

        throw ex;
    }
}

export async function showSavePlanPicker(name?: string): Promise<FileSystemFileHandle | undefined> {
    let suggestedName = name ?? 'plan';
    if (!suggestedName.endsWith('.xivplan')) {
        suggestedName += '.xivplan';
    }

    try {
        return await window.showSaveFilePicker({
            id: FILE_PICKER_ID,
            types: filePickerTypes,
            startIn: await getFileStartIn(),
            suggestedName,
        });
    } catch (ex) {
        if (isAbortError(ex)) {
            return undefined;
        }

        throw ex;
    }
}

export async function listDirectory(directory: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> {
    const entries: FileSystemHandle[] = [];

    for await (const [name, handle] of directory.entries()) {
        switch (handle.kind) {
            case 'file':
                if (name.endsWith('.xivplan')) {
                    entries.push(handle);
                }
                break;

            case 'directory':
                entries.push(handle);
                break;
        }
    }

    return entries;
}

export async function getPlanFolder(): Promise<FileSystemDirectoryHandle | undefined> {
    const db = await getDatabase();

    const folder = await db.get('folders', 'plans');
    if (!folder) {
        return undefined;
    }

    const permissions: FileSystemHandlePermissionDescriptor = {
        mode: 'readwrite',
    };

    if ((await folder.queryPermission(permissions)) === 'granted') {
        return folder;
    }

    if ((await folder.requestPermission(permissions)) === 'granted') {
        return folder;
    }

    return undefined;
}

export async function setPlanFolder(folder: FileSystemDirectoryHandle | undefined) {
    const db = await getDatabase();

    if (folder) {
        await db.put('folders', folder, 'plans');
    } else {
        await db.delete('folders', 'plans');
    }
}

export async function showPlanFolderPicker() {
    try {
        const handle = await window.showDirectoryPicker({
            id: FOLDER_PICKER_ID,
            mode: 'readwrite',
            startIn: await getFileStartIn(),
        });

        if (handle) {
            await setPlanFolder(handle);
        }

        return handle;
    } catch (ex) {
        if (isAbortError(ex)) {
            return undefined;
        }

        throw ex;
    }
}

interface Schema extends DBSchema {
    folders: {
        key: 'plans';
        value: FileSystemDirectoryHandle;
    };

    // Deprecated.
    recent: {
        key: number;
        value: never;
    };
}

const CURRENT_VERSION = 2;

const db = openDB<Schema>('xivplan-files', CURRENT_VERSION, {
    upgrade(db, oldVersion, newVersion) {
        if (oldVersion > CURRENT_VERSION) {
            console.warn(`Files database version downgrade from ${oldVersion} to ${newVersion}. Resetting database.`);
            db.deleteObjectStore('recent');
            db.deleteObjectStore('folders');
        }

        if (oldVersion < 1) {
            db.createObjectStore('folders');
        }

        // Recent files list was stored but never used. Removed it in v2.
        if (oldVersion < 2) {
            db.deleteObjectStore('recent');
        }
    },
});

async function getDatabase() {
    return await db;
}
