import { Field, mergeClasses } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);
    const height = useMemo(() => commonValue(objects, (obj) => obj.height), [objects]);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );
    const onHeightChanged = useSpinChanged((height: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, height })) }),
    );
    const { t } = useTranslation();

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label={t('SizeControl.Width')}>
                <SpinButton value={width} onChange={onWidthChanged} min={MIN_SIZE} step={5} />
            </Field>
            <Field label={t('SizeControl.Height')}>
                <SpinButton value={height} onChange={onHeightChanged} min={MIN_SIZE} step={5} />
            </Field>
        </div>
    );
};
