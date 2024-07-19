import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p1.png',
    backgroundOpacity: 35,
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p2.png',
    backgroundOpacity: 50,
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p3.png',
    backgroundOpacity: 35,
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p4.png',
    backgroundOpacity: 35,
};

export const ARENA_PRESETS_ULTIMATE_TEA = [PRESET_1, PRESET_2, PRESET_3, PRESET_4];
