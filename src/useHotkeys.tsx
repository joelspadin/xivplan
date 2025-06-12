import { RefObject, useContext, useEffect, useId } from 'react';
import { HotkeyCallback, Options, useHotkeys as useHotkeysBase, useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeyHelpContext, HotkeyInfo } from './HotkeyHelpContext';

export enum HotkeyScopes {
    AlwaysEnabled = 'alwaysEnabled', // Workaround for https://github.com/JohannesKlauss/react-hotkeys-hook/issues/908
    Default = 'default',
}

export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
    callback: HotkeyCallback,
    deps?: unknown[],
): RefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
    callback: HotkeyCallback,
    options?: Options,
    deps?: unknown[],
): RefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
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

    useHotkeyHelp(keys, category, help);

    return useHotkeysBase(keys, callback, options, deps);
}

export function useHotkeyHelp(keys: string, category: string, help: string): void {
    const map = useContext(HotkeyHelpContext);
    const id = useId();
    useEffect(() => {
        if (!help) {
            return;
        }

        map.set(id, { keys, category, help });

        return () => {
            map.delete(id);
        };
    }, [map, id, keys, category, help]);
}

export function useRegisteredHotkeys(): HotkeyInfo[] {
    const map = useContext(HotkeyHelpContext);
    return [...map.values()].sort((a, b) => {
        const result = a.category.localeCompare(b.category);
        if (result !== 0) {
            return result;
        }

        return a.keys.localeCompare(b.keys);
    });
}

export function useHotkeyBlocker() {
    const { disableScope, enableScope } = useHotkeysContext();

    return useEffect(() => {
        disableScope(HotkeyScopes.Default);

        return () => {
            enableScope(HotkeyScopes.Default);
        };
    }, [disableScope, enableScope]);
}
