import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, DEFAULT_RADIAL_TICKS, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    ticks: DEFAULT_RADIAL_TICKS,
    backgroundImage: '/arena/top-p1.png',
    backgroundOpacity: 50,
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    ticks: DEFAULT_RADIAL_TICKS,
    backgroundImage: '/arena/top-p2.png',
    backgroundOpacity: 35,
};

export const ARENA_PRESETS_ULTIMATE_TOP = [PRESET_1, PRESET_2];
