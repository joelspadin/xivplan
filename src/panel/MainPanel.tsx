import { makeStyles, Tab, TabList } from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
import { EditMode } from '../editMode';
import { useEditMode } from '../useEditMode';
import { ArenaPanel } from './ArenaPanel';
import { DrawPanel } from './DrawPanel';
import { PANEL_WIDTH } from './PanelStyles';
import { PrefabsPanel } from './PrefabsPanel';
import { StatusPanel } from './StatusPanel';

const enum Tabs {
    Arena = 'arena',
    Objects = 'objects',
    Status = 'status',
    Draw = 'draw',
}

export const MainPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState(Tabs.Objects);
    const [, setEditMode] = useEditMode();

    const handleTabChanged = useCallback(
        (tab: Tabs) => {
            setTab(tab);

            // Cancel any special edit mode when changing tabs.
            // Draw tab should always default to draw mode.
            const newMode = tab === Tabs.Draw ? EditMode.Draw : EditMode.Normal;
            setEditMode(newMode);
        },
        [setEditMode],
    );

    return (
        <div className={classes.wrapper}>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => handleTabChanged(data.value as Tabs)}>
                <Tab value={Tabs.Arena}>Arena</Tab>
                <Tab value={Tabs.Objects}>Objects</Tab>
                <Tab value={Tabs.Status}>Icons</Tab>
                <Tab value={Tabs.Draw}>Draw</Tab>
            </TabList>
            <div className={classes.container}>
                {tab === Tabs.Arena && <ArenaPanel />}
                {tab === Tabs.Objects && <PrefabsPanel />}
                {tab === Tabs.Status && <StatusPanel />}
                {tab === Tabs.Draw && <DrawPanel />}
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        gridArea: 'left-panel',
        width: `${PANEL_WIDTH}px`,
        userSelect: 'none',
    },

    container: {
        maxHeight: 'calc(100% - 44px)',
        overflow: 'auto',
    },
});
