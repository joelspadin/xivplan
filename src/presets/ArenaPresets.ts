import { ArenaPreset } from '../scene';
import { ARENA_PRESETS_CRITERION } from './Criterion';
import { ARENA_PRESETS_GENERAL } from './General';
import { ARENA_PRESETS_TRIALS } from './Trials';
import { ARENA_PRESETS_SAVAGE_EDEN } from './savage/Eden';
import { ARENA_PRESETS_SAVAGE_PANDAEMONIUM } from './savage/Pandaemonium';
import { ARENA_PRESETS_ULTIMATE_DSU } from './ultimate/DSU';
import { ARENA_PRESETS_ULTIMATE_TEA } from './ultimate/TEA';
import { ARENA_PRESETS_ULTIMATE_TOP } from './ultimate/TOP';
import { ARENA_PRESETS_ULTIMATE_UCOB } from './ultimate/UCOB';
import { ARENA_PRESETS_ULTIMATE_UWU } from './ultimate/UWU';

export const ARENA_PRESETS: Record<string, Record<string, ArenaPreset[]>> = {
    '': {
        General: ARENA_PRESETS_GENERAL,
        Criterion: ARENA_PRESETS_CRITERION,
        Trials: ARENA_PRESETS_TRIALS,
    },
    Savage: {
        Eden: ARENA_PRESETS_SAVAGE_EDEN,
        Pandæmonium: ARENA_PRESETS_SAVAGE_PANDAEMONIUM,
    },
    Ultimate: {
        'Unending Coil': ARENA_PRESETS_ULTIMATE_UCOB,
        "The Weapon's Refrain": ARENA_PRESETS_ULTIMATE_UWU,
        'The Epic of Alexander': ARENA_PRESETS_ULTIMATE_TEA,
        "Dragonsong's Reprise": ARENA_PRESETS_ULTIMATE_DSU,
        'The Omega Protocol': ARENA_PRESETS_ULTIMATE_TOP,
    },
};
