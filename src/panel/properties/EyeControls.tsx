import { Switch } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { EyeObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const EyeInvertControl: React.FC<PropertiesControlProps<EyeObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const invert = useMemo(() => commonValue(objects, (obj) => !!obj.invert), [objects]);

    const toggleInvert = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'invert', !invert)) }),
        [dispatch, objects, invert],
    );

    return <Switch label="Look towards" checked={invert} onClick={toggleInvert} />;
};
