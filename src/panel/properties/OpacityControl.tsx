import React, { useCallback, useMemo } from 'react';
import { OpacitySlider } from '../../OpacitySlider';
import { useScene } from '../../SceneProvider';
import { TransparentObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const OpacityControl: React.FC<PropertiesControlProps<TransparentObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const opacity = useMemo(() => commonValue(objects, (obj) => obj.opacity), [objects]);

    const onOpacityChanged = useCallback(
        (newOpacity: number) => {
            if (newOpacity !== opacity) {
                dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, opacity: newOpacity })) });
            }
        },
        [dispatch, objects, opacity],
    );

    return <OpacitySlider value={opacity} onChange={onOpacityChanged} />;
};
