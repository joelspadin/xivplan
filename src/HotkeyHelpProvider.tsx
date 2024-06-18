import React, { useContext, useEffect, useId } from 'react';
import { Options, useHotkeys as useHotkeysBase } from 'react-hotkeys-hook';
import type { HotkeyCallback, RefType } from 'react-hotkeys-hook/dist/types';
import { HotkeyHelpContext, HotkeyInfo } from './HotkeyHelpContext';

export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
    callback: HotkeyCallback,
    deps?: unknown[],
): React.MutableRefObject<RefType<T>>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
    callback: HotkeyCallback,
    options?: Options,
    deps?: unknown[],
): React.MutableRefObject<RefType<T>>;
export function useHotkeys<T extends HTMLElement>(
    keys: string,
    category: string,
    help: string,
    callback: HotkeyCallback,
    options?: Options | unknown[],
    deps?: unknown[],
): React.MutableRefObject<RefType<T>> {
    if (Array.isArray(options)) {
        deps = options;
        options = {};
    }

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
