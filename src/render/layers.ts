import type { Enum } from '../util';

export const LayerName = {
    Ground: 'ground',
    Default: 'default',
    Foreground: 'fg',
    Active: 'active',
    Controls: 'control',
} as const;
export type LayerName = Enum<typeof LayerName>;

export const LayerSelector = {
    Ground: '.' + LayerName.Ground,
    Default: '.' + LayerName.Default,
    Foreground: '.' + LayerName.Foreground,
    Active: '.' + LayerName.Active,
    Controls: '.' + LayerName.Controls,
} as const;
export type LayerSelector = Enum<typeof LayerSelector>;
