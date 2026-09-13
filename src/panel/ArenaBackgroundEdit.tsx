import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../DeferredInput';
import { useScene } from '../SceneProvider';
import { SliderField } from '../SliderField';

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
                <SliderField
                    label="Background image opacity"
                    min={5}
                    step={5}
                    value={arena.backgroundOpacity ?? 100}
                    showValue
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
