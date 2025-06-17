import { COLOR_FUSCHIA, COLOR_GREEN, COLOR_ORANGE } from '../render/sceneTheme';
import { ObjectType, SceneObject, Tether, TetherType, isMoveable } from '../scene';
import { combinations } from '../util';

const DEFAULT_WIDTH = 6;
const DEFAULT_OPACITY = 80;

interface TetherConfig {
    name: string;
    color: string;
}

const CONFIGS: Record<TetherType, TetherConfig> = {
    [TetherType.Line]: { name: 'Tether', color: COLOR_ORANGE },
    [TetherType.Close]: { name: 'Tether (stay together)', color: COLOR_GREEN },
    [TetherType.Far]: { name: 'Tether (stay apart)', color: COLOR_FUSCHIA },
    [TetherType.MinusMinus]: { name: 'Tether (−/−)', color: COLOR_ORANGE },
    [TetherType.PlusMinus]: { name: 'Tether (+/−)', color: COLOR_ORANGE },
    [TetherType.PlusPlus]: { name: 'Tether (+/+)', color: COLOR_ORANGE },
};

export function getTetherName(tether: TetherType) {
    return CONFIGS[tether].name;
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
