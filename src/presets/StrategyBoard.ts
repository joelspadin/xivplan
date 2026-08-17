import { type Arena, type ArenaPreset, ArenaShape, GridType } from '../scene';

const DEFAULT_STGY_ARENA: Arena = {
    width: 512,
    height: 384,
    padding: 164,
    shape: ArenaShape.Rectangle,
    grid: { type: GridType.None },
};

export const PRESET_STGY_NONE: ArenaPreset = {
    name: 'None / Grey',
    isSpoilerFree: true,
    arena: DEFAULT_STGY_ARENA,
};

export const PRESET_STGY_CHECKERED: ArenaPreset = {
    name: 'Checkered',
    isSpoilerFree: true,
    arena: {
        ...DEFAULT_STGY_ARENA,
        backgroundImage: '/arena/stgy-checkered.svg',
    },
};

export const PRESET_STGY_CHECKERED_CIRCLE: ArenaPreset = {
    name: 'Checkered (Circular Field)',
    isSpoilerFree: true,
    arena: {
        ...DEFAULT_STGY_ARENA,
        backgroundImage: '/arena/stgy-checkered-circle.svg',
    },
};

export const PRESET_STGY_CHECKERED_SQUARE: ArenaPreset = {
    name: 'Checkered (Square Field)',
    isSpoilerFree: true,
    arena: {
        ...DEFAULT_STGY_ARENA,
        backgroundImage: '/arena/stgy-checkered-square.svg',
    },
};

export const PRESET_STGY_GREY_CIRCLE: ArenaPreset = {
    name: 'Grey (Circular Field)',
    isSpoilerFree: true,
    arena: {
        ...DEFAULT_STGY_ARENA,
        backgroundImage: '/arena/stgy-grey-circle.svg',
    },
};

export const PRESET_STGY_GREY_SQUARE: ArenaPreset = {
    name: 'Grey (Square Field)',
    isSpoilerFree: true,
    arena: {
        ...DEFAULT_STGY_ARENA,
        backgroundImage: '/arena/stgy-grey-square.svg',
    },
};

export const ARENA_PRESETS_STGY = [
    PRESET_STGY_NONE,
    PRESET_STGY_CHECKERED,
    PRESET_STGY_CHECKERED_CIRCLE,
    PRESET_STGY_CHECKERED_SQUARE,
    PRESET_STGY_GREY_CIRCLE,
    PRESET_STGY_GREY_SQUARE,
];
