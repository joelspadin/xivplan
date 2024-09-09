import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_2: ArenaPreset = {
    name: 'AAC Light-heavyweight M2',
    shape: ArenaShape.Circle,
    width: 800,
    height: 800,
    padding: 20,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion2.svg',
};

const PRESET_3: ArenaPreset = {
    name: 'AAC Light-heavyweight M3',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion3.svg',
};

const PRESET_4: ArenaPreset = {
    name: 'AAC Light-heavyweight M4',
    spoilerFreeName: 'AAC Light-heavyweight M4 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
    backgroundImage: '/arena/arcadion4.svg',
};

const PRESET_4_PHASE_2: ArenaPreset = {
    name: 'AAC Light-heavyweight M4 (Phase 2)',
    spoilerFreeName: 'AAC Light-heavyweight M4 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 450,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 3, columns: 4 },
    backgroundImage: '/arena/arcadion4-p2.svg',
};

export const ARENA_PRESETS_RAID_ARCADION = [PRESET_2, PRESET_3, PRESET_4, PRESET_4_PHASE_2];
