import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../scene';

const ARENA_PRESET_3_3: ArenaPreset = {
    name: 'Square 3x3',
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

const ARENA_PRESET_4_4: ArenaPreset = {
    name: 'Square 4x4',
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

const ARENA_PRESET_5_5: ArenaPreset = {
    name: 'Square 5x5',
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

const ARENA_PRESET_4_4_CIRCLE: ArenaPreset = {
    name: 'Circle 4x4',
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

const ARENA_PRESET_6_DIV_CIRCLE: ArenaPreset = {
    name: 'Circle 6 slice',
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

const ARENA_PRESET_8_DIV_CIRCLE: ArenaPreset = {
    name: 'Circle 8 slice',
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

const ARENA_PRESET_EDEN_2: ArenaPreset = {
    name: "Eden's Gate: Descent (E2)",
    shape: ArenaShape.Rectangle,
    width: 400,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 6,
        columns: 4,
    },
};

const ARENA_PRESET_EDEN_5: ArenaPreset = {
    name: "Eden's Verse: Fulmination (E5)",
    shape: ArenaShape.Rectangle,
    width: 800,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Custom,
        rows: [-200, -100, 0, 100, 200],
        columns: [-150, -80, 80, 150],
    },
};

const ARENA_PRESET_EDEN_12: ArenaPreset = {
    name: "Eden's Promise: Eternity (E12)",
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Radial,
        angularDivs: 16,
        radialDivs: 2,
    },
};

export const ARENA_PRESETS: ArenaPreset[] = [
    ARENA_PRESET_3_3,
    ARENA_PRESET_4_4,
    ARENA_PRESET_5_5,
    ARENA_PRESET_4_4_CIRCLE,
    ARENA_PRESET_6_DIV_CIRCLE,
    ARENA_PRESET_8_DIV_CIRCLE,
    ARENA_PRESET_EDEN_2,
    ARENA_PRESET_EDEN_5,
    ARENA_PRESET_EDEN_12,
];
