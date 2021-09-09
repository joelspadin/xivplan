import React from 'react';
import icon from '../../assets/zone/starburst.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneStarburst: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Starburst AOE" icon={icon} />;
};
