import { Tab, TabList, makeStyles } from '@fluentui/react-components';
import React, { useState } from 'react';
import { StatusMarkers } from './StatusMarkers';
import { StatusSearch } from './StatusSearch';

export const StatusPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState('markers');
    const [filter, setFilter] = useState('');

    return (
        <div className={classes.panel}>
            <TabList size="small" selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as string)}>
                <Tab value="markers">Markers</Tab>
                <Tab value="status">Status effects</Tab>
            </TabList>
            {tab === 'markers' && <StatusMarkers />}
            {tab === 'status' && <StatusSearch filter={filter} onFilterChanged={setFilter} />}
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
