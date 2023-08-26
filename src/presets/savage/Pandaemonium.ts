import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';
import { SPOKES_45_DEGREES } from '../Components';

const PRESET_7: ArenaPreset = {
    name: 'Abyssos: The Seventh Circle',
    shape: ArenaShape.Rectangle,
    width: 760,
    height: 700,
    padding: 50,
    grid: { type: GridType.None },
    backgroundImage: '/arena/p7.png',
};

const PRESET_9: ArenaPreset = {
    name: 'Anabaseios: The Ninth Circle',
    shape: ArenaShape.Circle,
    width: 650,
    height: 650,
    padding: DEFAULT_ARENA_PADDING - 20,
    grid: {
        type: GridType.CustomRadial,
        rings: [125, 225],
        spokes: SPOKES_45_DEGREES,
    },
};

const PRESET_10: ArenaPreset = {
    name: 'Anabaseios: The Tenth Circle',
    shape: ArenaShape.Rectangle,
    width: 14 * 60,
    height: 12 * 60,
    padding: 50,
    grid: { type: GridType.None },
    backgroundImage: '/arena/p10.png',
};

const PRESET_10_CENTER: ArenaPreset = {
    name: 'Anabaseios: The Tenth Circle (Center)',
    shape: ArenaShape.Rectangle,
    width: 6 * 80,
    height: 8 * 80,
    padding: DEFAULT_ARENA_PADDING - 20,
    grid: {
        type: GridType.Rectangular,
        columns: 6,
        rows: 8,
    },
};

const PRESET_11: ArenaPreset = {
    name: 'Anabaseios: The Eleventh Circle',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/p11.png',
};

const PRESET_12: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 2,
    },
    backgroundImage: '/arena/p12.png',
};

const PRESET_12_CHECKERBOARD: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Checkerboard)',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 2,
    },
    backgroundImage: '/arena/p12_checker.png',
};

const PRESET_12_CHECKERBOARD_2: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Checkerboard Mirror)',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 2,
    },
    backgroundImage: '/arena/p12_checker2.png',
};

const PRESET_12_OCTAGON: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Octagon)',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.CustomRectangular,
        rows: [-225, 0, 225],
        columns: [0],
    },
    backgroundImage: '/arena/p12_octagon.png',
};

const PRESET_12_PHASE_2: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Phase 2)',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 450,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 3,
        columns: 2,
    },
    backgroundImage: '/arena/p12-p2.png',
};

export const ARENA_PRESETS_SAVAGE_PANDAEMONIUM = [
    PRESET_7,
    PRESET_9,
    PRESET_10,
    PRESET_10_CENTER,
    PRESET_11,
    PRESET_12,
    PRESET_12_CHECKERBOARD,
    PRESET_12_CHECKERBOARD_2,
    PRESET_12_OCTAGON,
    PRESET_12_PHASE_2,
];
