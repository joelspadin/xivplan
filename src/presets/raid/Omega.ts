import { type ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_8: ArenaPreset = {
    name: 'Sigmascape V4.0 [O8]',
    arena: {
        shape: ArenaShape.Circle,
        width: 600,
        height: 600,
        padding: DEFAULT_ARENA_PADDING,
        grid: {
            type: GridType.Radial,
            // Use 16 divisions to account for teleport destinations
            angularDivs: 16,
            radialDivs: 1,
        },
        backgroundImage: '/arena/o8.png',
    },
};

const PRESET_8_PHASE_2: ArenaPreset = {
    name: 'Sigmascape V4.0 [O8] (Phase 2)',
    spoilerFreeName: 'Sigmascape V4.0 [O8] ████',
    arena: {
        shape: ArenaShape.Circle,
        width: 600,
        height: 600,
        padding: DEFAULT_ARENA_PADDING,
        grid: {
            type: GridType.Radial,
            angularDivs: 8,
            radialDivs: 1,
        },
        backgroundImage: '/arena/o8-p2.png',
    },
};
const PRESET_8_FORSAKEN: ArenaPreset = {
    name: 'Sigmascape V4.0 [O8] (Forsaken)',
    spoilerFreeName: 'Sigmascape V4.0 [O8] ████',
    arena: {
        shape: ArenaShape.Circle,
        width: 600,
        height: 600,
        padding: DEFAULT_ARENA_PADDING,
        grid: {
            type: GridType.Radial,
            angularDivs: 8,
            radialDivs: 1,
        },
        backgroundImage: '/arena/o8-forsaken.png',
    },
};

export const ARENA_PRESETS_RAID_OMEGA = [PRESET_8, PRESET_8_PHASE_2, PRESET_8_FORSAKEN];
