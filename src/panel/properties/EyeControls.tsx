import { Switch } from '@fluentui/react-components';
import React from 'react';
import type { EyeObject } from '../../scene';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const EyeInvertControl: React.FC<PropertiesControlProps<EyeObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const invert = commonValue(objects, (obj) => !!obj.invert);

    const toggleInvert = () => update(setOrOmitAction<EyeObject>('invert', !invert));

    return <Switch label="Look towards" checked={invert} onClick={toggleInvert} />;
};
