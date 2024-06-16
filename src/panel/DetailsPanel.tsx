import { Divider, makeStyles, Tab, TabList, typographyStyles } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useMedia } from 'react-use';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING, PANEL_WIDTH } from './PanelStyles';
import { PropertiesPanel } from './PropertiesPanel';
import { SceneObjectsPanel } from './SceneObjectsPanel';

const PROPERTIES_TITLE = 'Properties';
const OBJECTS_TITLE = 'Scene';

export const DetailsPanel: React.FC = () => {
    const isWide = useMedia(`(min-width: 1700px)`);
    const isTall = useMedia('(min-height: 900px)');

    if (isWide) {
        return <WideDetailsPanel />;
    }

    if (isTall) {
        return <TallDetailsPanel />;
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

            <section className={classes.section}>
                <header className={classes.header}>{OBJECTS_TITLE}</header>
                <div className={classes.scrollable}>
                    <SceneObjectsPanel />
                </div>
            </section>
        </div>
    );
};

const TallDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const controlClasses = useControlStyles();

    return (
        <div className={classes.tallPanel}>
            <header className={classes.header}>{PROPERTIES_TITLE}</header>
            <PropertiesPanel />

            <Divider inset className={controlClasses.divider} />

            <header className={classes.header}>{OBJECTS_TITLE}</header>
            <div className={classes.scrollable}>
                <SceneObjectsPanel />
            </div>
        </div>
    );
};

const ShortDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState('properties');

    return (
        <div className={classes.wrapper}>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as string)}>
                <Tab value="properties">{PROPERTIES_TITLE}</Tab>
                <Tab value="object">{OBJECTS_TITLE}</Tab>
            </TabList>
            {tab === 'properties' && <PropertiesPanel />}
            {tab === 'objects' && <SceneObjectsPanel />}
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

    tallPanel: {
        display: 'flex',
        flexFlow: 'column',

        gridArea: 'right-panel',
        flexShrink: '0 !important',
        height: '100%',
        width: `${PANEL_WIDTH}px`,
    },

    scrollable: {
        overflowY: 'auto',
    },
});
