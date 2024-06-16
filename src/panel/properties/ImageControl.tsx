import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import { ImageObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ImageControl: React.FC<PropertiesControlProps<ImageObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const image = useMemo(() => commonValue(objects, (obj) => obj.image), [objects]);

    const setImage = useCallback(
        (image: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, image })) }),
        [dispatch, objects],
    );

    return (
        <Field label="Image URL">
            <DeferredInput value={image ?? ''} onChange={(dev, data) => setImage(data.value)} />
        </Field>
    );
};
