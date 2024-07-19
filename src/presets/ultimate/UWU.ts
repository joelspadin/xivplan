import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_3A: ArenaPreset = {
    name: 'Phase 3a',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
    backgroundImage: '/arena/uwu-p3a.png',
    backgroundOpacity: 35,
};

const PRESET_3B: ArenaPreset = {
    name: 'Phase 3b',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
    backgroundImage: '/arena/uwu-p3b.png',
    backgroundOpacity: 35,
};

const PRESET_3C: ArenaPreset = {
    name: 'Phase 3c',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
    backgroundImage: '/arena/uwu-p3c.png',
    backgroundOpacity: 35,
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/uwu-p5.png',
    backgroundOpacity: 35,
};

export const ARENA_PRESETS_ULTIMATE_UWU = [PRESET_3A, PRESET_3B, PRESET_3C, PRESET_5];
