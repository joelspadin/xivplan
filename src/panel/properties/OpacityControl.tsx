import React, { useCallback, useMemo } from 'react';
import { OpacitySlider } from '../../OpacitySlider';
import { useScene } from '../../SceneProvider';
import { TransparentObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const OpacityControl: React.FC<PropertiesControlProps<TransparentObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();

    const opacity = useMemo(() => commonValue(objects, (obj) => obj.opacity), [objects]);
    const hide = useMemo(() => commonValue(objects, (obj) => !!obj.hide), [objects]);

    const setOpacity = useCallback(
        (newOpacity: number) => {
            if (newOpacity !== opacity) {
                dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, opacity: newOpacity })) });
            }
        },
        [dispatch, objects, opacity],
    );

    return (
        <OpacitySlider
            className={className}
            value={opacity}
            disabled={hide}
            onChange={(ev, data) => setOpacity(data.value)}
        />
    );
};
