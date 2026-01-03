import { Field, ToggleButton, Tooltip } from '@fluentui/react-components';
import { LinkRegular, LockClosedRegular, LockMultipleRegular, LockOpenRegular } from '@fluentui/react-icons';
import React from 'react';
import { ConnectionType } from '../../EditModeContext';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';
import { ConnectedObjectSelector } from './ConnectedObjectSelector';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const x = commonValue(objects, (obj) => obj.x);
    const y = commonValue(objects, (obj) => obj.y);
    const pinned = commonValue(objects, (obj) => !!obj.pinned);
    const currentlyLinked = commonValue(objects, (obj) => obj.positionParentId !== undefined) || false;

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
                <Field label={<PositionLabel coordinate="X" currentlyLinked={currentlyLinked} />}>
                    <SpinButton value={x} onChange={onXChanged} step={1} />
                </Field>
                <Field label={<PositionLabel coordinate="Y" currentlyLinked={currentlyLinked} />}>
                    <SpinButton value={y} onChange={onYChanged} step={1} />
                </Field>
                <Tooltip content={tooltip} relationship="label" withArrow>
                    <ToggleButton checked={pinned || false} onClick={onTogglePinned} icon={icon} />
                </Tooltip>
            </div>
            <div className={classes.row}>
                <ConnectedObjectSelector objects={objects} connectionType={ConnectionType.POSITION} />
            </div>
        </>
    );
};

interface PositionLabelProps {
    readonly coordinate: string;
    readonly currentlyLinked: boolean;
}

const PositionLabel: React.FC<PositionLabelProps> = ({ coordinate, currentlyLinked }) => {
    const classes = useControlStyles();
    return (
        <span className={classes.label}>
            {coordinate}
            {currentlyLinked && (
                <Tooltip content="Relative to the object below" relationship="description">
                    <LinkRegular />
                </Tooltip>
            )}
        </span>
    );
};
