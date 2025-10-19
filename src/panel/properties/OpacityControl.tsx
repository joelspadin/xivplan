import React from 'react';
import { OpacitySlider } from '../../OpacitySlider';
import { SceneObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const OpacityControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();

    const opacity = commonValue(objects, (obj) => obj.opacity);
    const hide = commonValue(objects, (obj) => !!obj.hide);

    const setOpacity = (newOpacity: number, transient: boolean) => {
        if (newOpacity !== opacity) {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, opacity: newOpacity })), transient });
        }
    };

    return (
        <OpacitySlider
            className={className}
            value={opacity}
            disabled={hide}
            onChange={(ev, data) => setOpacity(data.value, data.transient)}
            onCommit={() => dispatch({ type: 'commit' })}
        />
    );
};
