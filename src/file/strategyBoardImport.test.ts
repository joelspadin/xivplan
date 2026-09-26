import { describe, expect, test } from 'vitest';
import { ICON_TYPE_IDS } from 'xiv-strat-board';
import { NEW_ICON_TYPES, STGY_OBJECT_INTERPRETERS } from './strategyBoardImport';

describe('Type interpreter list', () => {
    test('supports all xiv-strat-board IconTypes', () => {
        Object.keys(ICON_TYPE_IDS).forEach((type) => {
            expect.soft(STGY_OBJECT_INTERPRETERS[type], `missing support for '${type}'`).toBeDefined();
        });
    });
    test('has no unused mappings', () => {
        const usedTypeStrings = new Set(Object.keys(ICON_TYPE_IDS).concat(Object.values(NEW_ICON_TYPES)));
        Object.keys(STGY_OBJECT_INTERPRETERS).forEach((type) => {
            expect.soft(usedTypeStrings, `support for type '${type}' was added but it doesn't exist`).toContain(type);
        });
    });
});

describe('New types', () => {
    test('have an interpreter availalable', () => {
        Object.values(NEW_ICON_TYPES).forEach((type) => {
            expect.soft(STGY_OBJECT_INTERPRETERS[type], `missing support for new '${type}'`).toBeDefined();
        });
    });
    test('are not already supported by xiv-strat-board', () => {
        Object.values(NEW_ICON_TYPES).forEach((type) => {
            expect
                .soft(Object.keys(ICON_TYPE_IDS), `'${type}' is already supported by xiv-strat-board`)
                .not.toContain(type);
        });
    });
});
