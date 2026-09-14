import { ToggleButton, Tooltip } from '@fluentui/react-components';
import { EyeLinesRegular, EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import React from 'react';
import type { BaseObject } from '../../scene';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const HideControl: React.FC<PropertiesControlProps<BaseObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const show = commonValue(objects, (obj) => !obj.hide);
    const icon = getIcon(show);
    const tooltip = getTooltip(show);

    const handleToggle = () => update(setOrOmitAction<BaseObject>('hide', !!show));

    return (
        <>
            <Tooltip content={tooltip} relationship="label" withArrow>
                <ToggleButton checked={!!show} onClick={handleToggle} icon={icon} />
            </Tooltip>
        </>
    );
};

function getIcon(show: boolean | undefined) {
    return show === undefined ? <EyeLinesRegular /> : show ? <EyeRegular /> : <EyeOffRegular />;
}

function getTooltip(show: boolean | undefined) {
    return show === undefined ? 'Multiple visibilities' : show ? 'Shown' : 'Hidden';
}
