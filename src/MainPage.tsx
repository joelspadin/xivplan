import { classNamesFunction, IStyle, Stack, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { EditModeProvider } from './EditModeProvider';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { SceneProvider } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';

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
                backgroundColor: theme.palette.neutralLighter,
                overflow: 'auto',
                minWidth: 400,
            },
        };
    }, theme);

    return (
        <SceneProvider>
            <EditModeProvider>
                <SelectionProvider>
                    <PanelDragProvider>
                        <RegularHotkeyHandler />

                        <Stack horizontal className={classNames.root}>
                            <MainPanel />
                            <Stack.Item className={classNames.stage}>
                                <StepSelect />
                                <SceneRenderer />
                            </Stack.Item>
                            <DetailsPanel />
                        </Stack>
                    </PanelDragProvider>
                </SelectionProvider>
            </EditModeProvider>
        </SceneProvider>
    );
};
