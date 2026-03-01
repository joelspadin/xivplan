import { RefObject, useContext, useEffect } from 'react';
import { HotkeyCallback, Options, useHotkeys as useHotkeysBase, useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeyHelpContext, HotkeyInfo } from './HotkeyHelpContext';
import { useCancelConnectionSelection } from './useEditMode';
import { rotateArray } from './util';

export enum HotkeyScopes {
    AlwaysEnabled = 'alwaysEnabled', // Workaround for https://github.com/JohannesKlauss/react-hotkeys-hook/issues/908
    Default = 'default',
}

export function useHotkeys<T extends HTMLElement>(
    keys: string,
    info: Partial<HotkeyInfo>,
    callback: HotkeyCallback,
    deps?: unknown[],
): RefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    info: Partial<HotkeyInfo>,
    callback: HotkeyCallback,
    options?: Options,
    deps?: unknown[],
): RefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    info: Partial<HotkeyInfo>,
    callback: HotkeyCallback,
    options?: Options | unknown[],
    deps?: unknown[],
): RefObject<T | null> {
    if (Array.isArray(options)) {
        deps = options;
        options = {};
    }

    options = {
        scopes: [HotkeyScopes.Default],
        ...options,
    };

    useHotkeyHelp({
        keys: info.keys ?? keys,
        category: info.category ?? '',
        help: info.help ?? '',
    });

    return useHotkeysBase(keys, callback, options, deps);
}

export function useHotkeyHelp(info: HotkeyInfo): void {
    const map = useContext(HotkeyHelpContext);
    useEffect(() => {
        if (!info.keys || !info.category || !info.help) {
            return;
        }

        const id = `${info.keys}-${info.category}-${info.help}`;
        map.set(id, { ...info, sortKey: getSortKey(info) });

        return () => {
            map.delete(id);
        };
    }, [map, info]);
}

export function useRegisteredHotkeys(): HotkeyInfo[] {
    const map = useContext(HotkeyHelpContext);
    return [...map.values()].sort((a, b) => {
        return a.sortKey.localeCompare(b.sortKey);
    });
}

export function useHotkeyBlocker() {
    const { disableScope, enableScope } = useHotkeysContext();
    const cancelConnectionSelection = useCancelConnectionSelection();

    return useEffect(() => {
        disableScope(HotkeyScopes.Default);
        cancelConnectionSelection();

        return () => {
            enableScope(HotkeyScopes.Default);
        };
    }, [disableScope, enableScope, cancelConnectionSelection]);
}

function getSortKey(info: HotkeyInfo) {
    let keys = info.keys.split('+').map((k) => k.trim().toLowerCase());
    const nonModifierIdx = keys.findIndex((k) => k !== 'ctrl' && k !== 'shift' && k !== 'alt');
    if (nonModifierIdx > 0) {
        keys = rotateArray(keys, nonModifierIdx);
    }

    return [info.category, ...keys].join('+');
}
