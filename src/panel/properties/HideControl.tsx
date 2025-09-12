import { ToggleButton, Tooltip } from '@fluentui/react-components';
import { EyeLinesRegular, EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import React from 'react';
import { BaseObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const HideControl: React.FC<PropertiesControlProps<BaseObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const show = commonValue(objects, (obj) => !obj.hide);

    const handleToggle = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hide', !!show)) });

    const icon = show === undefined ? <EyeLinesRegular /> : show ? <EyeRegular /> : <EyeOffRegular />;
    const tooltip = show ? 'Hide' : 'Show';

    return (
        <>
            <Tooltip content={tooltip} relationship="label" withArrow>
                <ToggleButton checked={!!show} onClick={handleToggle} icon={icon} />
            </Tooltip>
        </>
    );
};
