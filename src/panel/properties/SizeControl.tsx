import { Field, mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { SpinButton } from '../../SpinButton';
import { MIN_SIZE } from '../../prefabs/bounds';
import type { ResizeableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const SizeControl: React.FC<PropertiesControlProps<ResizeableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const width = commonValue(objects, (obj) => obj.width);
    const height = commonValue(objects, (obj) => obj.height);

    const onWidthChanged = (width: number) => update({ props: { width } });
    const onHeightChanged = (height: number) => update({ props: { height } });

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label="Width">
                <SpinButton value={width} onValueChange={onWidthChanged} min={MIN_SIZE} step={5} />
            </Field>
            <Field label="Height">
                <SpinButton value={height} onValueChange={onHeightChanged} min={MIN_SIZE} step={5} />
            </Field>
        </div>
    );
};
