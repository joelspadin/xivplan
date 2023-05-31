import { createContext } from 'react';

export interface HotkeyInfo {
    category: string;
    keys: string;
    help: string;
}

export const HotkeyHelpContext = createContext<Map<string, HotkeyInfo>>(new Map());
