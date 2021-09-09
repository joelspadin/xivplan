import React from 'react';
import icon from '../../assets/zone/square.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneSquare: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Square AOE" icon={icon} />;
};
