import React from 'react';
import icon from '../../assets/zone/eye.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneEye: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Look away" icon={icon} />;
};
