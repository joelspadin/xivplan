import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    return (
        <Field label={t('ImageControl.ImageURL')}>
            <DeferredInput value={image ?? ''} onChange={(dev, data) => setImage(data.value)} />
        </Field>
    );
};
