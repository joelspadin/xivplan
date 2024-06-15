import { Field, SpinButton, mergeClasses } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ResizeableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const SizeControl: React.FC<PropertiesControlProps<ResizeableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);
    const height = useMemo(() => commonValue(objects, (obj) => obj.height), [objects]);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );
    const onHeightChanged = useSpinChanged((height: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, height })) }),
    );

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label="Width">
                <SpinButton
                    value={width ?? 0}
                    displayValue={width?.toString() ?? ''}
                    onChange={onWidthChanged}
                    min={20}
                    step={10}
                />
            </Field>
            <Field label="Height">
                <SpinButton
                    value={height ?? 0}
                    displayValue={height?.toString() ?? ''}
                    onChange={onHeightChanged}
                    min={20}
                    step={10}
                />
            </Field>
        </div>
    );
};
