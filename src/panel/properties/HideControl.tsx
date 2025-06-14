import { ToggleButton, Tooltip } from '@fluentui/react-components';
import { EyeLinesRegular, EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { BaseObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const HideControl: React.FC<PropertiesControlProps<BaseObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const show = useMemo(() => commonValue(objects, (obj) => !obj.hide), [objects]);

    const handleToggle = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hide', !!show)) }),
        [dispatch, objects, show],
    );

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
