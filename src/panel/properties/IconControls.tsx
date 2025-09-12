import { Field } from '@fluentui/react-components';
import React from 'react';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { IconObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const IconTimeControl: React.FC<PropertiesControlProps<IconObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const time = commonValue(objects, (obj) => obj.time ?? 0);

    const onChange = useSpinChanged((time: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, time })) }),
    );

    return (
        <Field label="Duration" className={classes.cell}>
            <SpinButtonUnits value={time} min={0} suffix=" s" onChange={onChange} />
        </Field>
    );
};

export const IconStacksControl: React.FC<PropertiesControlProps<IconObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const stacks = commonValue(objects, getStackCount);
    const maxStacks = Math.min(...objects.map((obj) => obj.maxStacks ?? 0));

    const onChange = useSpinChanged((value: number) => {
        dispatch({ type: 'update', value: objects.map((obj) => setStacks(obj, value)) });
    });

    if (maxStacks === 0) {
        return null;
    }

    return (
        <Field label="Stacks" className={classes.cell}>
            <SpinButton value={stacks} min={1} max={maxStacks} onChange={onChange} />
        </Field>
    );
};

function setStacks(object: Readonly<IconObject>, stacks: number): IconObject {
    if (!object.iconId || !object.maxStacks) {
        return object;
    }

    stacks = Math.min(stacks, object.maxStacks);

    const iconId = (object.iconId + stacks - 1).toString().padStart(6, '0');

    const image = object.image.replace(/\d{6}(?=(?:_hr1)?\.tex)/, iconId);

    return { ...object, image };
}

function getStackCount(object: IconObject) {
    if (!object.iconId) {
        return undefined;
    }

    const name = basename(object.image);
    const currentId = parseInt(name);

    if (isNaN(currentId)) {
        return undefined;
    }

    return currentId - object.iconId + 1;
}

function basename(path: string) {
    const index = path.lastIndexOf('/');
    return index < 0 ? path : path.substring(index + 1);
}
