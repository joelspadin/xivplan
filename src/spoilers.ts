import { DBSchema, openDB } from 'idb';

export async function getRevealedArenaPresets(): Promise<string[]> {
    const db = await getDatabase();

    const store = db.transaction('arenaPresets').objectStore('arenaPresets');
    return await store.getAllKeys();
}

export async function revealArenaPreset(key: string) {
    const db = await getDatabase();

    await db.put('arenaPresets', { key });
}

interface Schema extends DBSchema {
    arenaPresets: {
        key: string;
        value: { key: string };
    };
}

const CURRENT_VERSION = 1;

const db = openDB<Schema>('xivplan-spoilers', CURRENT_VERSION, {
    upgrade(db, oldVersion, newVersion) {
        if (oldVersion > CURRENT_VERSION) {
            console.warn(
                `Spoilers satabase version downgrade from ${oldVersion} to ${newVersion}. Resetting database.`,
            );
            db.deleteObjectStore('arenaPresets');
        }

        if (oldVersion < 1) {
            db.createObjectStore('arenaPresets', { keyPath: 'key' });
        }
    },
});

async function getDatabase() {
    return await db;
}
