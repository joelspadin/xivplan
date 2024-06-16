import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React, { useContext, useEffect } from 'react';
import { EditModeProvider } from './EditModeProvider';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { MainToolbar } from './MainToolbar';
import { PanelDragProvider } from './PanelDragProvider';
import { useScene } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';
import { DarkModeContext } from './ThemeProvider';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { SceneRenderer } from './render/SceneRenderer';
import { useIsDirty } from './useIsDirty';

export const MainPage: React.FC = () => {
    return (
        <EditModeProvider>
            <SelectionProvider>
                <PanelDragProvider>
                    <MainPageContent />
                </PanelDragProvider>
            </SelectionProvider>
        </EditModeProvider>
    );
};

const MainPageContent: React.FC = () => {
    const classes = useStyles();
    const [darkMode] = useContext(DarkModeContext);

    usePageTitle();

    return (
        <>
            <RegularHotkeyHandler />
            <MainToolbar />

            {/* TODO: make panel collapsable */}
            <MainPanel />

            <StepSelect />

            <div className={mergeClasses(classes.stage, darkMode ? classes.dark : classes.light)}>
                <SceneRenderer />
            </div>

            {/* TODO: make panel collapsable */}
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

const useStyles = makeStyles({
    stage: {
        gridArea: 'content',
        overflow: 'auto',
        minWidth: '400px',
    },

    light: {
        backgroundColor: tokens.colorNeutralBackground3,
    },

    dark: {
        backgroundColor: tokens.colorNeutralBackground1,
    },
});
