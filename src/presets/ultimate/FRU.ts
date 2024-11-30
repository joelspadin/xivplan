import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, DEFAULT_RADIAL_TICKS, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Radial,
        angularDivs: 8,
        radialDivs: 1,
    },
    ticks: DEFAULT_RADIAL_TICKS,
    backgroundImage: '/arena/e11.svg',
};

export const ARENA_PRESETS_ULTIMATE_FRU = [PRESET_1];
