import { classNamesFunction, IStyle, Stack, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { getDeleteSelectionAction } from './actions';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { SceneProvider, useScene, useSceneUndoRedo } from './SceneProvider';
import { SelectionProvider, useSelection } from './SelectionProvider';

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
            },
        };
    }, theme);

    return (
        <SceneProvider>
            <SelectionProvider>
                <PanelDragProvider>
                    <HotkeyHandler />

                    <Stack horizontal className={classNames.root}>
                        <MainPanel />
                        <Stack.Item className={classNames.stage}>
                            <SceneRenderer />
                        </Stack.Item>
                        <DetailsPanel />
                    </Stack>
                </PanelDragProvider>
            </SelectionProvider>
        </SceneProvider>
    );
};

const UndoRedoHandler: React.FC = () => {
    const [undo, redo] = useSceneUndoRedo();

    useHotkeys('ctrl+z', (e) => {
        undo();
        e.preventDefault();
    });
    useHotkeys('ctrl+y', (e) => {
        redo();
        e.preventDefault();
    });

    return null;
};

const SelectionActionHandler: React.FC = () => {
    const [, dispatch] = useScene();
    const [selection, setSelection] = useSelection();

    useHotkeys(
        'delete',
        (e) => {
            if (selection) {
                dispatch(getDeleteSelectionAction(selection));
                setSelection(undefined);
                e.preventDefault();
            }
        },
        [selection, setSelection, dispatch],
    );

    return null;
};

const HotkeyHandler: React.FC = () => {
    return (
        <>
            <UndoRedoHandler />
            <SelectionActionHandler />
        </>
    );
};
