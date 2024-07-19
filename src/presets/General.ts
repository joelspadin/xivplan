import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../scene';

const PRESET_3_3: ArenaPreset = {
    name: 'Square 3x3',
    isSpoilerFree: true,
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 3,
        columns: 3,
    },
};

const PRESET_4_4: ArenaPreset = {
    name: 'Square 4x4',
    isSpoilerFree: true,
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 4,
    },
};

const PRESET_5_5: ArenaPreset = {
    name: 'Square 5x5',
    isSpoilerFree: true,
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 5,
        columns: 5,
    },
};

const PRESET_4_4_CIRCLE: ArenaPreset = {
    name: 'Circle 4x4',
    isSpoilerFree: true,
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 4,
    },
};

const PRESET_6_DIV_CIRCLE: ArenaPreset = {
    name: 'Circle 6 slice',
    isSpoilerFree: true,
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Radial,
        angularDivs: 6,
        radialDivs: 2,
    },
};

const PRESET_8_DIV_CIRCLE: ArenaPreset = {
    name: 'Circle 8 slice',
    isSpoilerFree: true,
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Radial,
        angularDivs: 8,
        radialDivs: 2,
    },
};

export const ARENA_PRESETS_GENERAL = [
    PRESET_3_3,
    PRESET_4_4,
    PRESET_5_5,
    PRESET_4_4_CIRCLE,
    PRESET_6_DIV_CIRCLE,
    PRESET_8_DIV_CIRCLE,
];
