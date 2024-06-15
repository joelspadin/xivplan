import { Field, makeStyles } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE } from '../../prefabs/bounds';
import { useSpinChanged2 } from '../../prefabs/useSpinChanged';
import { ArcZone, ConeZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ConeAngleControl: React.FC<PropertiesControlProps<ArcZone | ConeZone>> = ({ objects }) => {
    const classes = useStyles();
    const { dispatch } = useScene();

    const coneAngle = useMemo(() => commonValue(objects, (obj) => obj.coneAngle), [objects]);

    const onAngleChanged = useSpinChanged2((coneAngle: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, coneAngle })) }),
    );

    return (
        <Field label="Angle" className={classes.padded}>
            <SpinButtonUnits
                value={coneAngle}
                onChange={onAngleChanged}
                min={MIN_CONE_ANGLE}
                max={MAX_CONE_ANGLE}
                step={5}
                suffix="°"
            />
        </Field>
    );
};

const useStyles = makeStyles({
    padded: {
        marginRight: '42px',
    },
});
