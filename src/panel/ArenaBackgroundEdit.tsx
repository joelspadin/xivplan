import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FC = () => {
    const { scene, dispatch } = useScene();
    return (
        <>
            <Field label="Background image URL">
                <DeferredInput
                    value={scene.arena.backgroundImage}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackground', value: data.value, transient: true });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            </Field>
            {scene.arena.backgroundImage && (
                <OpacitySlider
                    label="Background image opacity"
                    value={scene.arena.backgroundOpacity ?? 100}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackgroundOpacity', value: data.value, transient: data.transient });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            )}
        </>
    );
};
