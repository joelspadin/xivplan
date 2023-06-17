import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p1.png',
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p2.png',
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p3.png',
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/tea-p4.png',
};

export const ARENA_PRESETS_ULTIMATE_TEA = [PRESET_1, PRESET_2, PRESET_3, PRESET_4];
