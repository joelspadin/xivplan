import { Field, SpinButton } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ExaflareZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_LENGTH = 2;

export const ExaflareLengthControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const length = useMemo(() => commonValue(objects, (obj) => obj.length), [objects]);

    const onLengthChanged = useSpinChanged((length: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, length })) }),
    );

    return (
        <Field label="Length" className={classes.rightGap}>
            <SpinButton
                value={length ?? 0}
                displayValue={length?.toString() ?? ''}
                onChange={onLengthChanged}
                min={MIN_LENGTH}
                step={1}
            />
        </Field>
    );
};
