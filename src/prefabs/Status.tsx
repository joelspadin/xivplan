import { makeDisplayName } from '../util';
import { StatusIcon } from './StatusIcon';

function makeIcon(name: string, icon: string, scale?: number) {
    const Component: React.FC = () => <StatusIcon name={name} icon={`/marker/${icon}`} scale={scale} />;
    Component.displayName = makeDisplayName(name);
    return Component;
}

export const StatusAttack1 = makeIcon('Attack 1', 'attack1.png', 2);
export const StatusAttack2 = makeIcon('Attack 2', 'attack2.png', 2);
export const StatusAttack3 = makeIcon('Attack 3', 'attack3.png', 2);
export const StatusAttack4 = makeIcon('Attack 4', 'attack4.png', 2);
export const StatusAttack5 = makeIcon('Attack 5', 'attack5.png', 2);
export const StatusAttack6 = makeIcon('Attack 6', 'attack6.png', 2);
export const StatusAttack7 = makeIcon('Attack 7', 'attack7.png', 2);
export const StatusAttack8 = makeIcon('Attack 8', 'attack8.png', 2);

export const StatusBind1 = makeIcon('Bind 1', 'bind1.png', 2);
export const StatusBind2 = makeIcon('Bind 2', 'bind2.png', 2);
export const StatusBind3 = makeIcon('Bind 3', 'bind3.png', 2);

export const StatusCounter1 = makeIcon('Counter 1', 'limit1.png');
export const StatusCounter2 = makeIcon('Counter 2', 'limit2.png');
export const StatusCounter3 = makeIcon('Counter 3', 'limit3.png');
export const StatusCounter4 = makeIcon('Counter 4', 'limit4.png');
export const StatusCounter5 = makeIcon('Counter 5', 'limit5.png');
export const StatusCounter6 = makeIcon('Counter 6', 'limit6.png');
export const StatusCounter7 = makeIcon('Counter 7', 'limit7.png');
export const StatusCounter8 = makeIcon('Counter 8', 'limit8.png');

export const StatusIgnore1 = makeIcon('Ignore 1', 'ignore1.png', 2);
export const StatusIgnore2 = makeIcon('Ignore 2', 'ignore2.png', 2);

export const StatusCircle = makeIcon('Circle', 'circle.png', 2);
export const StatusCross = makeIcon('Cross', 'cross.png', 2);
export const StatusSquare = makeIcon('Square', 'square.png', 2);
export const StatusTriangle = makeIcon('Triangle', 'triangle.png', 2);

export const StatusRedTarget = makeIcon('Target', 'target_red.png', 2);
export const StatusGreenTarget = makeIcon('Target', 'target_green.png', 2);
export const StatusPurpleTarget = makeIcon('Target', 'target_purple.png', 2);
export const StatusBlueCircleTarget = makeIcon('Target', 'target_blue.png', 2);
export const StatusCrosshairs = makeIcon('Crosshairs', 'target_crosshairs.png', 2);
export const StatusTankbuster = makeIcon('Tankbuster', 'tankbuster.png', 2);

export const StatusRedTargetOld = makeIcon('Target', 'red_target.png');
export const StatusGreenTargetOld = makeIcon('Target', 'green_target.png');
export const StatusBlueCircleTargetOld = makeIcon('Target', 'blue_circle.png');
export const StatusGreenCircleTargetOld = makeIcon('Target', 'green_circle.png');

export const StatusDice1 = makeIcon('Acceleration bomb 1', 'dice1.png');
export const StatusDice2 = makeIcon('Acceleration bomb 2', 'dice2.png');
export const StatusDice3 = makeIcon('Acceleration bomb 3', 'dice3.png');

export const StatusEdenYellow = makeIcon('Yellow marker', 'eden/yellow.png');
export const StatusEdenOrange = makeIcon('Orange marker', 'eden/orange.png');
export const StatusEdenBlue = makeIcon('Blue marker', 'eden/blue.png');

export const StatusUltimateCircle = makeIcon('Circle', 'shape_circle.png', 2);
export const StatusUltimateCross = makeIcon('Cross', 'shape_cross.png', 2);
export const StatusUltimateSquare = makeIcon('Square', 'shape_square.png', 2);
export const StatusUltimateTriangle = makeIcon('Triangle', 'shape_triangle.png', 2);
