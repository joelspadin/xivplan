import React from 'react';
import icon from '../../assets/zone/meteor.png';
import { PrefabIcon } from '../PrefabIcon';

export const ZoneMeteor: React.FunctionComponent = () => {
    return <PrefabIcon draggable name="Meteor/tower" icon={icon} />;
};
