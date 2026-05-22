import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import type { ImageObject } from '../../scene';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ImageControl: React.FC<PropertiesControlProps<ImageObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const update = useObjectUpdater(objects);

    const image = commonValue(objects, (obj) => obj.image);

    const setImage = (image: string) => update({ props: { image }, transient: true });

    return (
        <Field label="Image URL">
            <DeferredInput
                value={image}
                onChange={(dev, data) => setImage(data.value)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </Field>
    );
};
