import { Field, ToggleButton, Tooltip } from '@fluentui/react-components';
import { LinkRegular, LockClosedRegular, LockMultipleRegular, LockOpenRegular } from '@fluentui/react-icons';
import React from 'react';
import { ConnectionType } from '../../EditModeContext';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import type { MoveableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';
import { ConnectedObjectSelector } from './ConnectedObjectSelector';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const x = commonValue(objects, (obj) => obj.x);
    const y = commonValue(objects, (obj) => obj.y);
    const pinned = commonValue(objects, (obj) => !!obj.pinned);
    const currentlyLinked = commonValue(objects, (obj) => obj.positionParentId !== undefined) || false;

    const onTogglePinned = () => update(setOrOmitAction<MoveableObject>('pinned', !pinned));

    const onXChanged = useSpinChanged((x: number) => update({ props: { x } }));
    const onYChanged = useSpinChanged((y: number) => update({ props: { y } }));

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
