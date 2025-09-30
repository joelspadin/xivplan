import { DefaultAttachPosition } from '../scene';
import { makeDisplayName } from '../util';
import { StatusIcon } from './StatusIcon';

function makeMarkerIcon(name: string, icon: string, scale?: number) {
    const Component: React.FC = () => (
        <StatusIcon
            name={name}
            icon={`/marker/${icon}`}
            scale={scale}
            defaultAttachPosition={DefaultAttachPosition.TOP}
        />
    );
    Component.displayName = makeDisplayName(name);
    return Component;
}

export const StatusAttack1 = makeMarkerIcon('Attack 1', 'attack1.png', 2);
export const StatusAttack2 = makeMarkerIcon('Attack 2', 'attack2.png', 2);
export const StatusAttack3 = makeMarkerIcon('Attack 3', 'attack3.png', 2);
export const StatusAttack4 = makeMarkerIcon('Attack 4', 'attack4.png', 2);
export const StatusAttack5 = makeMarkerIcon('Attack 5', 'attack5.png', 2);
export const StatusAttack6 = makeMarkerIcon('Attack 6', 'attack6.png', 2);
export const StatusAttack7 = makeMarkerIcon('Attack 7', 'attack7.png', 2);
export const StatusAttack8 = makeMarkerIcon('Attack 8', 'attack8.png', 2);

export const StatusBind1 = makeMarkerIcon('Bind 1', 'bind1.png', 2);
export const StatusBind2 = makeMarkerIcon('Bind 2', 'bind2.png', 2);
export const StatusBind3 = makeMarkerIcon('Bind 3', 'bind3.png', 2);

export const StatusCounter1 = makeMarkerIcon('Counter 1', 'limit1.png');
export const StatusCounter2 = makeMarkerIcon('Counter 2', 'limit2.png');
export const StatusCounter3 = makeMarkerIcon('Counter 3', 'limit3.png');
export const StatusCounter4 = makeMarkerIcon('Counter 4', 'limit4.png');
export const StatusCounter5 = makeMarkerIcon('Counter 5', 'limit5.png');
export const StatusCounter6 = makeMarkerIcon('Counter 6', 'limit6.png');
export const StatusCounter7 = makeMarkerIcon('Counter 7', 'limit7.png');
export const StatusCounter8 = makeMarkerIcon('Counter 8', 'limit8.png');

export const StatusIgnore1 = makeMarkerIcon('Ignore 1', 'ignore1.png', 2);
export const StatusIgnore2 = makeMarkerIcon('Ignore 2', 'ignore2.png', 2);

export const StatusCircle = makeMarkerIcon('Circle', 'circle.png', 2);
export const StatusCross = makeMarkerIcon('Cross', 'cross.png', 2);
export const StatusSquare = makeMarkerIcon('Square', 'square.png', 2);
export const StatusTriangle = makeMarkerIcon('Triangle', 'triangle.png', 2);

export const StatusRedTarget = makeMarkerIcon('Target', 'red_target.png');
export const StatusGreenTarget = makeMarkerIcon('Target', 'green_target.png');
export const StatusBlueCircleTarget = makeMarkerIcon('Target', 'blue_circle.png');
export const StatusGreenCircleTarget = makeMarkerIcon('Target', 'green_circle.png');
export const StatusCrosshairs = makeMarkerIcon('Target', 'crosshairs.png');

export const StatusDice1 = makeMarkerIcon('Acceleration Bomb 1', 'dice1.png');
export const StatusDice2 = makeMarkerIcon('Acceleration Bomb 2', 'dice2.png');
export const StatusDice3 = makeMarkerIcon('Acceleration Bomb 3', 'dice3.png');

export const StatusEdenYellow = makeMarkerIcon('Yellow marker', 'eden/yellow.png');
export const StatusEdenOrange = makeMarkerIcon('Orange marker', 'eden/orange.png');
export const StatusEdenBlue = makeMarkerIcon('Blue marker', 'eden/blue.png');

export const StatusUltimateCircle = makeMarkerIcon('Circle', 'ultimate/circle.png');
export const StatusUltimateCross = makeMarkerIcon('Cross', 'ultimate/cross.png');
export const StatusUltimateSquare = makeMarkerIcon('Square', 'ultimate/square.png');
export const StatusUltimateTriangle = makeMarkerIcon('Triangle', 'ultimate/triangle.png');
