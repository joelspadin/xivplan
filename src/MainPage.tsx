import { classNamesFunction, IStyle, Stack, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { MainPanel } from './panel/MainPanel';
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
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            },
            stage: {
                backgroundColor: theme.palette.neutralLighterAlt,
            },
        };
    }, theme);

    return (
        <SceneProvider>
            <Stack horizontal className={classNames.root}>
                <MainPanel />
                <Stack.Item grow className={classNames.stage}>
                    Content goes here
                </Stack.Item>
            </Stack>
        </SceneProvider>
    );
};
