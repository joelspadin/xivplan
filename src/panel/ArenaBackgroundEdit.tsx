import React from 'react';
import { DeferredTextField } from '../DeferredTextField';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FC = () => {
    const { scene, dispatch } = useScene();
    return (
        <>
            <DeferredTextField
                label="Background image URL"
                value={scene.arena.backgroundImage}
                onChange={(value) => {
                    dispatch({ type: 'arenaBackground', value });
                }}
            />
            {scene.arena.backgroundImage && (
                <OpacitySlider
                    label="Background image opacity"
                    value={scene.arena.backgroundOpacity ?? 100}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackgroundOpacity', value: data.value });
                    }}
                />
            )}
        </>
    );
};
