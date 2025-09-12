import { Field, ToggleButton, Tooltip } from '@fluentui/react-components';
import { LockClosedRegular, LockMultipleRegular, LockOpenRegular } from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const x = commonValue(objects, (obj) => obj.x);
    const y = commonValue(objects, (obj) => obj.y);
    const pinned = commonValue(objects, (obj) => !!obj.pinned);

    const onTogglePinned = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'pinned', !pinned)) });

    const onXChanged = useSpinChanged((x: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, x })) }),
    );
    const onYChanged = useSpinChanged((y: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, y })) }),
    );

    const icon = pinned === undefined ? <LockMultipleRegular /> : pinned ? <LockClosedRegular /> : <LockOpenRegular />;
    const tooltip = pinned ? 'Unlock position' : 'Lock position';

    return (
        <>
            <div className={classes.row}>
                <Field label="X">
                    <SpinButton value={x} onChange={onXChanged} step={1} />
                </Field>
                <Field label="Y">
                    <SpinButton value={y} onChange={onYChanged} step={1} />
                </Field>
                <Tooltip content={tooltip} relationship="label" withArrow>
                    <ToggleButton checked={pinned} onClick={onTogglePinned} icon={icon} />
                </Tooltip>
            </div>
        </>
    );
};
