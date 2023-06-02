import { COLOR_FUSCHIA, COLOR_GREEN, COLOR_ORANGE } from '../render/SceneTheme';
import { ObjectType, SceneObject, Tether, TetherType, isMoveable } from '../scene';
import { combinations } from '../util';

const DEFAULT_WIDTH = 6;
const DEFAULT_OPACITY = 80;

interface TetherConfig {
    name: string;
    icon: string;
    color: string;
}

const CONFIGS: Record<TetherType, TetherConfig> = {
    [TetherType.Line]: { name: 'Tether', icon: 'tether.png', color: COLOR_ORANGE },
    [TetherType.Close]: { name: 'Tether (stay together)', icon: 'tether_close.png', color: COLOR_GREEN },
    [TetherType.Far]: { name: 'Tether (stay apart)', icon: 'tether_far.png', color: COLOR_FUSCHIA },
    [TetherType.MinusMinus]: { name: 'Tether (−/−)', icon: 'tether_minus_minus.png', color: COLOR_ORANGE },
    [TetherType.PlusMinus]: { name: 'Tether (+/−)', icon: 'tether_plus_minus.png', color: COLOR_ORANGE },
    [TetherType.PlusPlus]: { name: 'Tether (+/+)', icon: 'tether_plus_plus.png', color: COLOR_ORANGE },
};

function getTetherIconUrl(icon: string) {
    return new URL(`../assets/tether/${icon}`, import.meta.url).href;
}

export function getTetherName(tether: TetherType) {
    return CONFIGS[tether].name;
}

export function getTetherIcon(tether: TetherType) {
    return getTetherIconUrl(CONFIGS[tether].icon);
}

export function makeTether(startId: number, endId: number, tether = TetherType.Line): Omit<Tether, 'id'> {
    return {
        type: ObjectType.Tether,
        tether,
        startId,
        endId,
        width: DEFAULT_WIDTH,
        color: CONFIGS[tether].color,
        opacity: DEFAULT_OPACITY,
    };
}

export function makeTethers(objects: readonly SceneObject[], tether = TetherType.Line): Omit<Tether, 'id'>[] {
    const result: Omit<Tether, 'id'>[] = [];

    for (const [start, end] of combinations(objects)) {
        if (isMoveable(start) && isMoveable(end)) {
            result.push(makeTether(start.id, end.id, tether));
        }
    }

    return result;
}
