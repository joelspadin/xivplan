import { TextField } from '@fluentui/react';
import React from 'react';
import { useScene } from '../SceneProvider';

export const ArenaBackgroundEdit: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    return (
        <TextField
            label="Background image URL"
            value={scene.arena.backgroundImage}
            onChange={(ev, newValue) => {
                dispatch({ type: 'arenaBackground', value: newValue });
            }}
        />
    );
};
