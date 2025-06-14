import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import { NamedObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const NameControl: React.FC<PropertiesControlProps<NamedObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();

    const name = useMemo(() => commonValue(objects, (obj) => obj.name), [objects]);

    const setName = useCallback(
        (name: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, name })) }),
        [dispatch, objects],
    );

    return (
        <Field label="Name" className={className}>
            <DeferredInput value={name ?? ''} onChange={(ev, data) => setName(data.value)} />
        </Field>
    );
};
