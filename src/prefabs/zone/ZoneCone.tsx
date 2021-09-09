import React from 'react';
import icon from '../../assets/zone/cone.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneCone: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Cone AOE" icon={icon} />;
};
