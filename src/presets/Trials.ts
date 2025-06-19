import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../scene';

const PRESET_DIAMOND_WEAPON_1: ArenaPreset = {
    name: 'The Cloud Deck',
    shape: ArenaShape.None,
    width: 800,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: '/arena/cloud-deck.svg',
};

const PRESET_DIAMOND_WEAPON_2: ArenaPreset = {
    name: 'The Cloud Deck (Half)',
    shape: ArenaShape.Rectangle,
    width: 300,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.Rectangular, rows: 5, columns: 2 },
};

const PRESET_EVERKEEP: ArenaPreset = {
    name: 'Everkeep (Dawn of an Age)',
    spoilerFreeName: 'Dawntrail Trial 2',
    shape: ArenaShape.None,
    width: 300,
    height: 650,
    padding: 100,
    grid: { type: GridType.None },
    backgroundImage: '/arena/everkeep.svg',
};

export const ARENA_PRESETS_TRIALS = [PRESET_DIAMOND_WEAPON_1, PRESET_DIAMOND_WEAPON_2, PRESET_EVERKEEP];
