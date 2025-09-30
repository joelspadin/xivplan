import { Field } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { InnerRadiusObject, RadiusObject, isInnerRadiusObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const RadiusControl: React.FC<PropertiesControlProps<RadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const radius = useMemo(() => commonValue(objects, (obj) => obj.radius), [objects]);
    const hasInnerRadius = useMemo(() => objects[0] && isInnerRadiusObject(objects[0]), [objects]);

    const onRadiusChanged = useSpinChanged((radius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, radius })) }),
    );
    const { t } = useTranslation();
    const label = hasInnerRadius ? t('RadiusControl.Radius1') : t('RadiusControl.Radius');

    return (
        <Field label={label} className={classes.cell}>
            <SpinButton value={radius} onChange={onRadiusChanged} min={10} step={5} />
        </Field>
    );
};

export const InnerRadiusControl: React.FC<PropertiesControlProps<InnerRadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const innerRadius = useMemo(() => commonValue(objects, (obj) => obj.innerRadius), [objects]);

    const onInnerRadiusChanged = useSpinChanged((innerRadius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, innerRadius })) }),
    );
    const { t } = useTranslation();

    return (
        <Field label={t('RadiusControl.Radius2')} className={classes.cell}>
            <SpinButton value={innerRadius} onChange={onInnerRadiusChanged} min={10} step={5} />
        </Field>
    );
};
