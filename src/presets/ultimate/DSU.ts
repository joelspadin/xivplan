import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p1.png',
};

const PRESET_2A: ArenaPreset = {
    name: 'Phase 2a',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p2a.png',
};

const PRESET_2B: ArenaPreset = {
    name: 'Phase 2b',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p2b.png',
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p3.png',
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p4.png',
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p5.png',
};

export const ARENA_PRESETS_ULTIMATE_DSU = [PRESET_1, PRESET_2A, PRESET_2B, PRESET_3, PRESET_4, PRESET_5];
