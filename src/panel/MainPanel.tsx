import { makeStyles, Tab, TabList } from '@fluentui/react-components';
import React, { useState } from 'react';
import { EditMode } from '../editMode';
import { TabActivity } from '../TabActivity';
import { useEditMode } from '../useEditMode';
import { ArenaPanel } from './ArenaPanel';
import { DrawPanel } from './DrawPanel';
import { PANEL_WIDTH } from './PanelStyles';
import { PrefabsPanel } from './PrefabsPanel';
import { StatusPanel } from './StatusPanel';

type Tabs = 'arena' | 'objects' | 'status' | 'draw';

export const MainPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState<Tabs>('objects');
    const [, setEditMode] = useEditMode();

    const handleTabChanged = (tab: Tabs) => {
        setTab(tab);

        // Cancel any special edit mode when changing tabs.
        // Draw tab should always default to draw mode.
        const newMode = tab === 'draw' ? EditMode.Draw : EditMode.Normal;
        setEditMode(newMode);
    };

    return (
        <div className={classes.wrapper}>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => handleTabChanged(data.value as Tabs)}>
                <Tab value="arena">Arena</Tab>
                <Tab value="objects">Objects</Tab>
                <Tab value="status">Icons</Tab>
                <Tab value="draw">Draw</Tab>
            </TabList>
            <div className={classes.container}>
                <TabActivity value="arena" activeTab={tab}>
                    <ArenaPanel />
                </TabActivity>
                <TabActivity value="objects" activeTab={tab}>
                    <PrefabsPanel />
                </TabActivity>
                <TabActivity value="status" activeTab={tab}>
                    <StatusPanel />
                </TabActivity>
                <TabActivity value="draw" activeTab={tab}>
                    <DrawPanel />
                </TabActivity>
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
        height: 'calc(100% - 44px)',
        overflow: 'auto',
    },
});
