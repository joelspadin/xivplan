import React from 'react';
import icon from '../../assets/zone/knockback.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneKnockback: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Circular knockback" icon={icon} />;
};
