import React from 'react';
import counterClockwise from '../../assets/zone/rotate_ccw.png';
import clockwise from '../../assets/zone/rotate_cw.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneRotateClockwise: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Rotating clockwise" icon={clockwise} />;
};

export const ZoneRotateCounterClockwise: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Rotating counter-clockwise" icon={counterClockwise} />;
};
