import { ArenaPreset, ArenaShape, GridType } from '../../scene';

const PRESET_2: ArenaPreset = {
    name: 'AAC Light-heavyweight M2',
    shape: ArenaShape.Circle,
    width: 800,
    height: 800,
    padding: 20,
    grid: { type: GridType.None },
    backgroundImage: '/arena/arcadion2.svg',
};

export const ARENA_PRESETS_RAID_ARCADION = [PRESET_2];
