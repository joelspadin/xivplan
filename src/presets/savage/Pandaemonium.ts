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

export const ARENA_PRESETS_SAVAGE_PANDAEMONIUM = [PRESET_7, PRESET_9, PRESET_10, PRESET_10_CENTER];
