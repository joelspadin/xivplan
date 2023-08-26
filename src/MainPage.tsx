import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { EditModeProvider } from './EditModeProvider';
import { textToScene } from './file';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { MainCommandBar } from './MainCommandBar';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { Scene } from './scene';
import { SceneProvider, useScene } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';
import { useIsDirty } from './useIsDirty';

interface IContentStyles {
    stage: IStyle;
}

const getClassNames = classNamesFunction<Theme, IContentStyles>();

function getInitialScene(searchParams: URLSearchParams): Scene | undefined {
    const data = searchParams.get('plan');
    if (data) {
        try {
            return textToScene(data);
        } catch (ex) {
            console.error('Invalid plan data from URL', ex);
        }
    }

    return undefined;
}

export const MainPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const initialScene = useMemo(() => getInitialScene(searchParams), [searchParams]);

    return (
        <SceneProvider initialScene={initialScene}>
            <DirtyProvider>
                <EditModeProvider>
                    <SelectionProvider>
                        <PanelDragProvider>
                            <MainPageContent />
                        </PanelDragProvider>
                    </SelectionProvider>
                </EditModeProvider>
            </DirtyProvider>
        </SceneProvider>
    );
};

const MainPageContent: React.FC = () => {
    usePageTitle();
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            stage: {
                gridArea: 'content',
                overflow: 'auto',
                backgroundColor: theme.palette.neutralLighter,
                minWidth: 400,
            },
        };
    }, theme);

    return (
        <>
            <RegularHotkeyHandler />
            <MainCommandBar />

            <MainPanel />

            <StepSelect />

            <div className={classNames.stage}>
                <SceneRenderer />
            </div>

            <DetailsPanel />
        </>
    );
};

const DEFAULT_TITLE = 'FFXIV Raid Planner';

function usePageTitle() {
    const { source } = useScene();
    const isDirty = useIsDirty();

    useEffect(() => {
        const name = source?.name ?? DEFAULT_TITLE;
        const flag = isDirty ? ' ●' : '';
        document.title = `${name}${flag}`;
    }, [source, isDirty]);
}
