import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../scene';

const PRESET_DIAMOND_WEAPON_1: ArenaPreset = {
    name: 'The Cloud Deck',
    shape: ArenaShape.Rectangle,
    width: 800,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/cloud-deck.png',
};

const PRESET_DIAMOND_WEAPON_2: ArenaPreset = {
    name: 'The Cloud Deck (half)',
    shape: ArenaShape.Rectangle,
    width: 300,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 5, columns: 2 },
};

export const ARENA_PRESETS_TRIALS = [PRESET_DIAMOND_WEAPON_1, PRESET_DIAMOND_WEAPON_2];
