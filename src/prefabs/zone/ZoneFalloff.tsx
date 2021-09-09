import React from 'react';
import icon from '../../assets/zone/falloff.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneFalloff: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Proximity AOE" icon={icon} />;
};
