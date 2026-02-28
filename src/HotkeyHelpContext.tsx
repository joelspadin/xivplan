import { createContext } from 'react';

export interface HotkeyInfo {
    category: string;
    keys: string;
    help: string;
}

export interface HotkeyInfoWithSortKey extends HotkeyInfo {
    sortKey: string;
}

export const HotkeyHelpContext = createContext<Map<string, HotkeyInfoWithSortKey>>(new Map());
