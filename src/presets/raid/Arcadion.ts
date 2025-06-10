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

const PRESET_6: ArenaPreset = {
    name: 'AAC Cruiserweight M2',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion6.svg',
};

const PRESET_6_QUICKSAND: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Quicksand)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion6-quicksand.svg',
};

const PRESET_6_QUICKSAND_2: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Quicksand 2)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion6-quicksand2.svg',
};

const PRESET_6_RIVER: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Riverscape)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion6-river.svg',
};

const PRESET_6_VOLCANO: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Volcano)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion6-volcano.svg',
};

const PRESET_7: ArenaPreset = {
    name: 'AAC Cruiserweight M3',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
    backgroundImage: '/arena/arcadion7.svg',
};

const PRESET_7_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M3 (Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    shape: ArenaShape.Rectangle,
    width: 300,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.CustomRectangular, rows: [-150, 150], columns: [0] },
    backgroundImage: '/arena/arcadion7-p2.svg',
};

const PRESET_7_PHASE_3: ArenaPreset = {
    name: 'AAC Cruiserweight M3 (Phase 3)',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 8, columns: 8 },
    backgroundImage: '/arena/arcadion7-p3.svg',
};

const PRESET_8: ArenaPreset = {
    name: 'AAC Cruiserweight M4',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    shape: ArenaShape.Circle,
    width: 800,
    height: 800,
    padding: 20,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion8.svg',
};

const PRESET_8_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M4 (Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    shape: ArenaShape.Circle,
    width: 580,
    height: 580,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion8-p2.svg',
};

const PRESET_8_SAVAGE_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M4 (Savage Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    shape: ArenaShape.None,
    width: 840,
    height: 840,
    padding: 0,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion8-sp2.svg',
};

export const ARENA_PRESETS_RAID_ARCADION = [
    PRESET_2,
    PRESET_3,
    PRESET_4,
    PRESET_4_PHASE_2,
    PRESET_6,
    PRESET_6_QUICKSAND,
    PRESET_6_QUICKSAND_2,
    PRESET_6_RIVER,
    PRESET_6_VOLCANO,
    PRESET_7,
    PRESET_7_PHASE_2,
    PRESET_7_PHASE_3,
    PRESET_8,
    PRESET_8_PHASE_2,
    PRESET_8_SAVAGE_PHASE_2,
];
