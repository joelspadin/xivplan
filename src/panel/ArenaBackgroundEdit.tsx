import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FC = () => {
    const { arena, dispatch } = useScene();
    return (
        <>
            <Field label="Background image URL">
                <DeferredInput
                    value={arena.backgroundImage}
                    onChange={(ev, data) => {
                        dispatch({ type: 'updateArena', value: { backgroundImage: data.value }, transient: true });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            </Field>
            {arena.backgroundImage && (
                <OpacitySlider
                    label="Background image opacity"
                    value={arena.backgroundOpacity ?? 100}
                    onChange={(ev, data) => {
                        dispatch({
                            type: 'updateArena',
                            value: { backgroundOpacity: data.value },
                            transient: data.transient,
                        });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            )}
        </>
    );
};
