import * as React from 'react';
import { PrefabIcon } from './PrefabIcon';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => <PrefabIcon name={name} icon={new URL(`../assets/tether/${icon}`, import.meta.url).toString()} />;
}

export const TetherDefault = makeIcon('Tether', 'tether.png');
export const TetherPlusMinus = makeIcon('Tether (+/−)', 'tether_plus_minus.png');
export const TetherPlusPlus = makeIcon('Tether (+/+)', 'tether_plus_plus.png');
export const TetherMinusMinus = makeIcon('Tether (−/−)', 'tether_minus_minus.png');
export const TetherClose = makeIcon('Tether (stay together)', 'tether_close.png');
export const TetherFar = makeIcon('Tether (stay apart)', 'tether_far.png');
