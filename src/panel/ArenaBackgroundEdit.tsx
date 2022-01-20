import React from 'react';
import { DeferredTextField } from '../DeferredTextField';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FunctionComponent = () => {
    const { scene, dispatch } = useScene();
    return (
        <DeferredTextField
            label="Background image URL"
            value={scene.arena.backgroundImage}
            onChange={(newValue) => {
                dispatch({ type: 'arenaBackground', value: newValue });
            }}
        />
    );
};
