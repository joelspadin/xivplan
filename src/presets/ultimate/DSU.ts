import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p1.png',
    backgroundOpacity: 35,
};

const PRESET_2A: ArenaPreset = {
    name: 'Phase 2a',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p2a.png',
    backgroundOpacity: 35,
};

const PRESET_2B: ArenaPreset = {
    name: 'Phase 2b',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p2b.png',
    backgroundOpacity: 35,
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
    backgroundImage: '/arena/dsu-p3.png',
    backgroundOpacity: 25,
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p4.png',
    backgroundOpacity: 50,
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/dsu-p5.png',
    backgroundOpacity: 35,
};

export const ARENA_PRESETS_ULTIMATE_DSU = [PRESET_1, PRESET_2A, PRESET_2B, PRESET_3, PRESET_4, PRESET_5];
