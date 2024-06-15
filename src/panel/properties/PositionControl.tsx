import { Field, SpinButton, ToggleButton, Tooltip } from '@fluentui/react-components';
import { LockClosedRegular, LockMultipleRegular, LockOpenRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const x = useMemo(() => commonValue(objects, (obj) => obj.x), [objects]);
    const y = useMemo(() => commonValue(objects, (obj) => obj.y), [objects]);
    const pinned = useMemo(() => commonValue(objects, (obj) => !!obj.pinned), [objects]);

    const onTogglePinned = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'pinned', !pinned)) }),
        [dispatch, objects, pinned],
    );

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
                    <SpinButton value={x ?? 0} displayValue={x?.toString() ?? ''} onChange={onXChanged} step={10} />
                </Field>
                <Field label="Y">
                    <SpinButton value={y ?? 0} displayValue={y?.toString() ?? ''} onChange={onYChanged} step={10} />
                </Field>
                <Tooltip content={tooltip} relationship="label" withArrow>
                    <ToggleButton checked={pinned} onClick={onTogglePinned} icon={icon} />
                </Tooltip>
            </div>
        </>
    );
};
