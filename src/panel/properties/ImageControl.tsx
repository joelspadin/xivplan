import React, { useCallback, useMemo } from 'react';
import { DeferredTextField } from '../../DeferredTextField';
import { useScene } from '../../SceneProvider';
import { ImageObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ImageControl: React.FC<PropertiesControlProps<ImageObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const image = useMemo(() => commonValue(objects, (obj) => obj.image), [objects]);

    const onImageChanged = useCallback(
        (image: string | undefined) =>
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, image: image ?? '' })) }),
        [dispatch, objects],
    );

    return <DeferredTextField label="Image URL" value={image} onChange={onImageChanged} />;
};
