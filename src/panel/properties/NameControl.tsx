import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import type { NamedObject } from '../../scene';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const NameControl: React.FC<PropertiesControlProps<NamedObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();
    const update = useObjectUpdater(objects);

    const name = commonValue(objects, (obj) => obj.name);

    const setName = (name: string) => update({ props: { name }, transient: true });

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
