import { Field, mergeClasses, Tooltip } from '@fluentui/react-components';
import { LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { ConnectionType } from '../../EditModeContext';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { EnemyObject, EnemyRingStyle, isEnemy, RotateableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';
import { ConnectedObjectSelector } from './ConnectedObjectSelector';

export const RotationControl: React.FC<PropertiesControlProps<RotateableObject | EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const rotation = commonValue(objects, (obj) => obj.rotation);
    const noDirection = commonValue(objects, (obj) => isEnemy(obj) && obj.ring == EnemyRingStyle.NoDirection);
    const currentlyLinked = commonValue(objects, (obj) => obj.facingId !== undefined) || false;

    const onRotationChanged = useSpinChanged((rotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, rotation })) }),
    );

    return (
        <>
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <Field label={<RotationLabel currentlyLinked={currentlyLinked} />} className={classes.cell}>
                    <SpinButtonUnits
                        disabled={noDirection}
                        value={rotation}
                        onChange={onRotationChanged}
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
