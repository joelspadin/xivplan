import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import { ImageObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ImageControl: React.FC<PropertiesControlProps<ImageObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const image = commonValue(objects, (obj) => obj.image);

    const setImage = (image: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, image })), transient: true });

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
