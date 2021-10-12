import { useId } from '@fluentui/react-hooks';
import { KeyHandler } from 'hotkeys-js';
import React, { createContext, useContext, useEffect } from 'react';
import { Options, useHotkeys as useHotkeysBase } from 'react-hotkeys-hook';

export interface HotkeyInfo {
    category: string;
    keys: string;
    help: string;
}

const HotkeyHelpContext = createContext<Map<string, HotkeyInfo>>(new Map());

export function useHotkeys<T extends Element>(
    keys: string,
    category: string,
    help: string,
    callback: KeyHandler,
    deps?: unknown[],
): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(
    keys: string,
    category: string,
    help: string,
    callback: KeyHandler,
    options?: Options,
    deps?: unknown[],
): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(
    keys: string,
    category: string,
    help: string,
    callback: KeyHandler,
    options?: Options | unknown[],
    deps?: unknown[],
): React.MutableRefObject<T | null> {
    if (Array.isArray(options)) {
        deps = options;
        options = {};
    }

    const map = useContext(HotkeyHelpContext);
    const id = useId('key');
    useEffect(() => {
        map.set(id, { keys, category, help });

        return () => {
            map.delete(id);
        };
    }, [map, keys, category, help]);

    return useHotkeysBase(keys, callback, options, deps);
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
