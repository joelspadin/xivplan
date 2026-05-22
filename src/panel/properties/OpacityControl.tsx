import React from 'react';
import { OpacitySlider } from '../../OpacitySlider';
import type { SceneObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const OpacityControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();
    const update = useObjectUpdater(objects);

    const opacity = commonValue(objects, (obj) => obj.opacity);
    const hide = commonValue(objects, (obj) => !!obj.hide);

    const setOpacity = (newOpacity: number, transient: boolean) => {
        if (newOpacity !== opacity) {
            update({ props: { opacity: newOpacity }, transient });
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
