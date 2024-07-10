import { Field } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { IconObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const IconStacksControl: React.FC<PropertiesControlProps<IconObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const stacks = useMemo(() => commonValue(objects, getStackCount), [objects]);
    const maxStacks = useMemo(() => Math.min(...objects.map((obj) => obj.maxStacks ?? 0)), [objects]);

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
    const folder = iconId.substring(0, iconId.length - 3) + '000';

    return {
        ...object,
        image: `https://beta.xivapi.com/api/1/asset/ui/icon/${folder}/${iconId}_hr1.tex?format=png`,
    };
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
