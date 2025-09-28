import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FC = () => {
    const { scene, dispatch } = useScene();
    const { t } = useTranslation();
    return (
        <>
            <Field label={t('ArenaBackgroundEdit.BackgroundImageURL')}>
                <DeferredInput
                    value={scene.arena.backgroundImage}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackground', value: data.value });
                    }}
                />
            </Field>
            {scene.arena.backgroundImage && (
                <OpacitySlider
                    label={t('ArenaBackgroundEdit.BackgroundImageOpacity')}
                    value={scene.arena.backgroundOpacity ?? 100}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackgroundOpacity', value: data.value });
                    }}
                />
            )}
        </>
    );
};
