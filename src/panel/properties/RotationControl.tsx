import { Field, mergeClasses, Tooltip } from '@fluentui/react-components';
import { LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { ConnectionType } from '../../EditModeContext';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { type EnemyObject, EnemyRingStyle, isEnemy, type RotateableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';
import { ConnectedObjectSelector } from './ConnectedObjectSelector';

export const RotationControl: React.FC<PropertiesControlProps<RotateableObject | EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const rotation = commonValue(objects, (obj) => obj.rotation);
    const noDirection = commonValue(objects, (obj) => isEnemy(obj) && obj.ring == EnemyRingStyle.NoDirection);
    const currentlyLinked = commonValue(objects, (obj) => obj.facingId !== undefined) || false;

    const onRotationChanged = (rotation: number) => update({ props: { rotation } });

    return (
        <>
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <Field label={<RotationLabel currentlyLinked={currentlyLinked} />} className={classes.cell}>
                    <SpinButtonUnits
                        disabled={noDirection}
                        value={rotation}
                        onValueChange={onRotationChanged}
                        step={5}
                        fractionDigits={1}
                        suffix="°"
                    />
                </Field>
            </div>
            <div className={classes.row}>
                <ConnectedObjectSelector objects={objects} connectionType={ConnectionType.ROTATION} />
            </div>
        </>
    );
};

interface RotationLabelProps {
    readonly currentlyLinked: boolean;
}

const RotationLabel: React.FC<RotationLabelProps> = ({ currentlyLinked }) => {
    const classes = useControlStyles();
    return (
        <span className={classes.label}>
            Rotation
            {currentlyLinked && (
                <Tooltip content="Relative to 'facing' the object below" relationship="description">
                    <LinkRegular />
                </Tooltip>
            )}
        </span>
    );
};
