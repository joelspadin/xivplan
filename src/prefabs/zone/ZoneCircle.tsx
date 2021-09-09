import React from 'react';
import icon from '../../assets/zone/circle.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneCircle: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Circle AOE" icon={icon} />;
};
