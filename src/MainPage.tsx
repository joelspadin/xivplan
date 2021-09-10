import { classNamesFunction, IStyle, Stack, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { SceneProvider } from './SceneProvider';

interface IContentStyles {
    root: IStyle;
    stage: IStyle;
}

const getClassNames = classNamesFunction<Theme, IContentStyles>();

export const MainPage: React.FunctionComponent = () => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            root: {
                position: 'absolute',
                inset: 0,
            },
            stage: {
                backgroundColor: theme.palette.neutralLight,
                overflow: 'auto',
            },
        };
    }, theme);

    return (
        <SceneProvider>
            <PanelDragProvider>
                <Stack horizontal className={classNames.root}>
                    <MainPanel />
                    <Stack.Item className={classNames.stage}>
                        <SceneRenderer />
                    </Stack.Item>
                    <DetailsPanel />
                </Stack>
            </PanelDragProvider>
        </SceneProvider>
    );
};
