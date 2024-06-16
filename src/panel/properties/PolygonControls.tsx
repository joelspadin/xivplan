import { Field } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MAX_POLYGON_SIDES, MIN_POLYGON_SIDES } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { PolygonZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PolygonSidesControl: React.FC<PropertiesControlProps<PolygonZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const spokes = useMemo(() => commonValue(objects, (obj) => obj.sides), [objects]);

    const onSidesChanged = useSpinChanged((sides: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, sides })) }),
    );

    return (
        <Field label="Sides" className={classes.cell}>
            <SpinButton
                value={spokes}
                onChange={onSidesChanged}
                min={MIN_POLYGON_SIDES}
                max={MAX_POLYGON_SIDES}
                step={1}
            />
        </Field>
    );
};
