import { IButtonStyles, Icon, IconButton, mergeStyleSets } from '@fluentui/react';
import * as React from 'react';
import { PrefabIcon, PREFAB_ICON_SIZE } from './PrefabIcon';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => <PrefabIcon name={name} icon={new URL(`../assets/marker/${icon}`, import.meta.url).toString()} />;
}

export const MarkerAttack1 = makeIcon('Attack 1', 'attack1.png');
export const MarkerAttack2 = makeIcon('Attack 2', 'attack2.png');
export const MarkerAttack3 = makeIcon('Attack 3', 'attack3.png');
export const MarkerAttack4 = makeIcon('Attack 4', 'attack4.png');
export const MarkerAttack5 = makeIcon('Attack 5', 'attack5.png');

export const MarkerBind1 = makeIcon('Bind 1', 'bind1.png');
export const MarkerBind2 = makeIcon('Bind 2', 'bind2.png');
export const MarkerBind3 = makeIcon('Bind 3', 'bind3.png');

export const MarkerIgnore1 = makeIcon('Ignore 1', 'ignore1.png');
export const MarkerIgnore2 = makeIcon('Ignore 2', 'ignore2.png');

export const MarkerCircle = makeIcon('Circle', 'circle.png');
export const MarkerCross = makeIcon('Cross', 'cross.png');
export const MarkerSquare = makeIcon('Square', 'square.png');
export const MarkerTriangle = makeIcon('Triangle', 'triangle.png');

export const WaymarkA = makeIcon('Waymark A', 'waymark_a.png');
export const WaymarkB = makeIcon('Waymark B', 'waymark_b.png');
export const WaymarkC = makeIcon('Waymark C', 'waymark_c.png');
export const WaymarkD = makeIcon('Waymark D', 'waymark_d.png');
export const Waymark1 = makeIcon('Waymark 1', 'waymark_1.png');
export const Waymark2 = makeIcon('Waymark 2', 'waymark_2.png');
export const Waymark3 = makeIcon('Waymark 3', 'waymark_3.png');
export const Waymark4 = makeIcon('Waymark 4', 'waymark_4.png');

const PADDING = 8;

const classNames = mergeStyleSets({
    icon: {
        fontSize: PREFAB_ICON_SIZE - PADDING * 2,
        width: PREFAB_ICON_SIZE - PADDING * 2,
        height: PREFAB_ICON_SIZE - PADDING * 2,
        padding: PADDING,
    },
});

const buttonStyles: Partial<IButtonStyles> = {
    // icon: iconStyle,
};

export const DrawArrow: React.FunctionComponent = () => {
    return <Icon draggable title="Arrow" iconName="ArrowUpRight8" className={classNames.icon} />;
};

export const DrawPath: React.FunctionComponent = () => {
    // TODO: make checkable
    return <IconButton title="Draw path" iconProps={{ iconName: 'Brush' }} styles={buttonStyles} />;
};
