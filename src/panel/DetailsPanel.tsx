import {
    Divider,
    makeStyles,
    mergeClasses,
    Tab,
    TabList,
    TabValue,
    typographyStyles,
} from '@fluentui/react-components';
import React, { useState } from 'react';
import { useMedia } from 'react-use';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING, PANEL_WIDTH, WIDE_PANEL_WIDTH } from './PanelStyles';
import { PropertiesPanel } from './PropertiesPanel';
import { SceneObjectsPanel } from './SceneObjectsPanel';

const PROPERTIES_TITLE = 'Properties';
const OBJECTS_TITLE = 'Scene';

export const DetailsPanel: React.FC = () => {
    const isWide = useMedia(`(min-width: 1700px)`);

    if (isWide) {
        return <WideDetailsPanel />;
    }

    return <ShortDetailsPanel />;
};

const WideDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const controlClasses = useControlStyles();

    return (
        <div className={classes.widePanel}>
            <section className={classes.section}>
                <header className={classes.header}>{PROPERTIES_TITLE}</header>
                <div className={classes.scrollable}>
                    <PropertiesPanel />
                </div>
            </section>

            <Divider inset vertical className={controlClasses.divider} />

            <section className={mergeClasses(classes.section, classes.wideSection)}>
                <header className={classes.header}>{OBJECTS_TITLE}</header>
                <div className={classes.scrollable}>
                    <SceneObjectsPanel />
                </div>
            </section>
        </div>
    );
};

enum Tabs {
    Properties = 'properties',
    Objects = 'objects',
}

const ShortDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(Tabs.Properties);

    return (
        <div className={classes.wrapper}>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value)}>
                <Tab value={Tabs.Properties}>{PROPERTIES_TITLE}</Tab>
                <Tab value={Tabs.Objects}>{OBJECTS_TITLE}</Tab>
            </TabList>
            {tab === Tabs.Properties && <PropertiesPanel className={classes.shortPanelContent} />}
            {tab === Tabs.Objects && <SceneObjectsPanel className={classes.shortPanelContent} />}
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        gridArea: 'right-panel',
        flexShrink: '0 !important',
        width: `${PANEL_WIDTH}px`,
    },

    widePanel: {
        display: 'flex',
        flexFlow: 'row',

        gridArea: 'right-panel',
        flexShrink: '0 !important',
        height: '100%',
    },

    header: {
        ...typographyStyles.subtitle2,
        padding: `0 ${PANEL_PADDING}px`,
    },

    section: {
        width: `${PANEL_WIDTH}px`,
        display: 'flex',
        flexFlow: 'column',
    },

    wideSection: {
        width: `${WIDE_PANEL_WIDTH}px`,
    },

    scrollable: {
        overflowY: 'auto',
    },

    shortPanelContent: {
        height: 'calc(100vh - 48px - 60px)',
        overflow: 'auto',
    },
});
