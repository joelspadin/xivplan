import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import { NamedObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const NameControl: React.FC<PropertiesControlProps<NamedObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();

    const name = commonValue(objects, (obj) => obj.name);

    const setName = (name: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, name })), transient: true });

    return (
        <Field label="Name" className={className}>
            <DeferredInput
                value={name}
                onChange={(ev, data) => setName(data.value)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </Field>
    );
};
