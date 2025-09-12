import { Switch } from '@fluentui/react-components';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { EyeObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const EyeInvertControl: React.FC<PropertiesControlProps<EyeObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const invert = commonValue(objects, (obj) => !!obj.invert);

    const toggleInvert = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'invert', !invert)) });

    return <Switch label="Look towards" checked={invert} onClick={toggleInvert} />;
};
