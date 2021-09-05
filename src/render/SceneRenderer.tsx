import { ThemeContext, useTheme } from '@fluentui/react';
import React from 'react';
import { Stage } from 'react-konva';
import { SceneContext, useScene } from '../SceneProvider';
import { ArenaRenderer } from './ArenaRenderer';
import { getCanvasSize } from './coord';

export const SceneRenderer: React.FunctionComponent = () => {
    const theme = useTheme();
    const [scene, dispatch] = useScene();
    const size = getCanvasSize(scene);

    return (
        <Stage {...size}>
            <ThemeContext.Provider value={theme}>
                <SceneContext.Provider value={[scene, dispatch]}>
                    <ArenaRenderer />
                </SceneContext.Provider>
            </ThemeContext.Provider>
        </Stage>
    );
};
