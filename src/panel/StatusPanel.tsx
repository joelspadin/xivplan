import { Tab, TabList, TabValue, makeStyles } from '@fluentui/react-components';
import React, { useState } from 'react';
import { StatusMarkers } from './StatusMarkers';
import { StatusSearch } from './StatusSearch';

enum Tabs {
    Markers = 'marker',
    Status = 'status',
}

export const StatusPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(Tabs.Markers);
    const [filter, setFilter] = useState('');

    return (
        <div className={classes.panel}>
            <TabList size="small" selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value)}>
                <Tab value={Tabs.Markers}>Markers</Tab>
                <Tab value={Tabs.Status}>Status effects</Tab>
            </TabList>
            {tab === Tabs.Markers && <StatusMarkers />}
            {tab === Tabs.Status && <StatusSearch filter={filter} onFilterChanged={setFilter} />}
        </div>
    );
};

const useStyles = makeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        overflow: 'hidden',
    },
});
