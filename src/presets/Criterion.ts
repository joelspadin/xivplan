import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../scene';

const PRESET_ZELESS_GAH: ArenaPreset = {
    name: "Sil'dihn Subterrane: Shadowcaster Zeless Gah",
    shape: ArenaShape.Rectangle,
    width: 450,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 3,
    },
};

export const ARENA_PRESETS_CRITERION = [PRESET_ZELESS_GAH];
