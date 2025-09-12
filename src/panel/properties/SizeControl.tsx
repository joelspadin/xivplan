import { Field, mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MIN_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ResizeableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const SizeControl: React.FC<PropertiesControlProps<ResizeableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const width = commonValue(objects, (obj) => obj.width);
    const height = commonValue(objects, (obj) => obj.height);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );
    const onHeightChanged = useSpinChanged((height: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, height })) }),
    );

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label="Width">
                <SpinButton value={width} onChange={onWidthChanged} min={MIN_SIZE} step={5} />
            </Field>
            <Field label="Height">
                <SpinButton value={height} onChange={onHeightChanged} min={MIN_SIZE} step={5} />
            </Field>
        </div>
    );
};
