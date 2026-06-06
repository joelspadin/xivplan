import { Button, Image, Tab, TabList, makeStyles, tokens } from '@fluentui/react-components';
import React, { use } from 'react';
import { Job, getJob, getJobIconUrl, type JobProps } from '../../jobs';
import type { PartyObject } from '../../scene';
import { TabActivity } from '../../TabActivity';
import { useObjectUpdater } from '../../useObjectUpdater';
import { PartyTabContext, type PartyTabs } from '../PartyTabContext';
import type { PropertiesControlProps } from '../PropertiesControl';

function jobGrid(rows: Job[][]): JobProps[][] {
    return rows.map((row) => row.map(getJob));
}

const ROLE_ICON_CHOICES = jobGrid([
    [Job.RoleAny, Job.RoleSupport],
    [Job.RoleTank, Job.RoleTank1, Job.RoleTank2],
    [Job.RoleHealer, Job.RoleHealer1, Job.RoleHealer2, Job.RolePureHealer, Job.RoleBarrierHealer],
    [Job.RoleDps, Job.RoleDps1, Job.RoleDps2, Job.RoleDps3, Job.RoleDps4],
    [Job.RoleMelee, Job.RoleMelee1, Job.RoleMelee2],
    [Job.RoleRanged, Job.RoleRanged1, Job.RoleRanged2, Job.RolePhysicalRanged, Job.RoleMagicRanged],
]);

const JOB_ICON_CHOICES = jobGrid([
    [Job.Paladin, Job.Warrior, Job.DarkKnight, Job.Gunbreaker],
    [Job.WhiteMage, Job.Scholar, Job.Astrologian, Job.Sage],
    [Job.Monk, Job.Dragoon, Job.Samurai, Job.Reaper, Job.Ninja, Job.Viper],
    [Job.BlackMage, Job.Summoner, Job.RedMage, Job.Pictomancer],
    [Job.Bard, Job.Machinist, Job.Dancer],
    [Job.Beastmaster, Job.BlueMage],
]);

type JobClickHandler = (name: string, image: string) => void;

interface PartyIconListProps {
    onClick: JobClickHandler;
}

interface JobGridProps {
    jobs: JobProps[][];
    onClick: JobClickHandler;
}

const JobGrid: React.FC<JobGridProps> = ({ jobs, onClick }) => {
    const classes = useStyles();

    return jobs.map((row, i) => (
        <div key={i} className={classes.row}>
            {row.map((job) => {
                const icon = getJobIconUrl(job.icon);

                return (
                    <Button
                        key={job.name}
                        className={classes.button}
                        appearance="transparent"
                        title={job.name}
                        icon={<Image src={icon} width={32} height={32} draggable={false} />}
                        onClick={() => onClick(job.name, icon)}
                    />
                );
            })}
        </div>
    ));
};

const PartyIconList: React.FC<PartyIconListProps> = ({ onClick }) => {
    const classes = useStyles();
    const [tab, setTab] = use(PartyTabContext);

    return (
        <div>
            <TabList
                className={classes.tabs}
                size="small"
                selectedValue={tab}
                onTabSelect={(ev, data) => setTab(data.value as PartyTabs)}
            >
                <Tab value="roles">Roles</Tab>
                <Tab value="jobs">Jobs</Tab>
            </TabList>
            <div className={classes.container}>
                <TabActivity value="roles" activeTab={tab}>
                    <JobGrid jobs={ROLE_ICON_CHOICES} onClick={onClick} />
                </TabActivity>
                <TabActivity value="jobs" activeTab={tab}>
                    <JobGrid jobs={JOB_ICON_CHOICES} onClick={onClick} />
                </TabActivity>
            </div>
        </div>
    );
};

export const PartyIconControl: React.FC<PropertiesControlProps<PartyObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const onClick = (name: string, image: string) => update({ props: { name, image } });

    return <PartyIconList onClick={onClick} />;
};

const useStyles = makeStyles({
    tabs: {
        marginLeft: `calc(-1 * ${tokens.spacingHorizontalXS})`,
    },

    container: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalM,
    },

    row: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
    },

    button: {
        border: 'none',
        width: '32px',
        height: '32px',
    },
});
