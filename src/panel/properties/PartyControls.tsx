import { Button, Image, Label, Tab, TabList, makeStyles, tokens } from '@fluentui/react-components';
import React, { useState } from 'react';
import { Job, type JobProps, getJob, getJobIconUrl } from '../../jobs';
import type { PartyObject } from '../../scene';
import { TabActivity } from '../../TabActivity';
import { useObjectUpdater } from '../../useObjectUpdater';
import type { PropertiesControlProps } from '../PropertiesControl';

const ROLE_ICON_CHOICES = [
    [Job.RoleTank, Job.RoleTank1, Job.RoleTank2, Job.RoleSupport, Job.RoleAny],
    [Job.RoleHealer, Job.RoleHealer1, Job.RoleHealer2, Job.RolePureHealer, Job.RoleBarrierHealer],
    [Job.RoleMelee, Job.RoleMelee1, Job.RoleMelee2],
    [Job.RoleRanged, Job.RoleRanged1, Job.RoleRanged2, Job.RolePhysicalRanged, Job.RoleMagicRanged],
    [Job.RoleDps, Job.RoleDps1, Job.RoleDps2, Job.RoleDps3, Job.RoleDps4],
].map((row) => row.map((job) => getJob(job)));
const JOB_ICON_CHOICES = [
    [Job.Paladin, Job.Warrior, Job.DarkKnight, Job.Gunbreaker],
    [Job.WhiteMage, Job.Scholar, Job.Astrologian, Job.Sage],
    [Job.Monk, Job.Dragoon, Job.Samurai, Job.Reaper, Job.Ninja, Job.Viper],
    [Job.BlackMage, Job.Summoner, Job.RedMage, Job.Pictomancer, Job.BlueMage],
    [Job.Bard, Job.Machinist, Job.Dancer],
].map((row) => row.map((job) => getJob(job)));

type PlayerTabs = 'roles' | 'jobs';

interface PartyIconListProps {
    onClick: (name: string, image: string) => void;
}

const PartyIconList: React.FC<PartyIconListProps> = ({ onClick }) => {
    const classes = useStyles();
    const [tab, setTab] = useState<PlayerTabs>('roles');

    const jobButton = (job: JobProps) => {
        const icon = getJobIconUrl(job.icon);
        return (
            <Button
                key={job.name}
                appearance="transparent"
                title={job.name}
                icon={<Image src={icon} width={32} height={32} draggable={false} />}
                onClick={() => onClick(job.name, icon)}
            />
        );
    };

    return (
        <>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as PlayerTabs)}>
                <Tab value="roles">Roles</Tab>
                <Tab value="jobs">Jobs</Tab>
            </TabList>
            <div className={classes.container}>
                <TabActivity value="roles" activeTab={tab}>
                    {ROLE_ICON_CHOICES.map((row, i) => (
                        <div key={i} className={classes.row}>
                            {row.map(jobButton)}
                        </div>
                    ))}
                </TabActivity>
                <TabActivity value="jobs" activeTab={tab}>
                    {JOB_ICON_CHOICES.map((row, i) => (
                        <div key={i} className={classes.row}>
                            {row.map(jobButton)}
                        </div>
                    ))}
                </TabActivity>
            </div>
        </>
    );
};

export const PartyIconControl: React.FC<PropertiesControlProps<PartyObject>> = ({ objects }) => {
    const classes = useStyles();
    const update = useObjectUpdater(objects);

    const onClick = (name: string, image: string) => update({ props: { name, image } });

    return (
        <div>
            <Label className={classes.label}>Variant</Label>
            <PartyIconList onClick={onClick} />
        </div>
    );
};

const useStyles = makeStyles({
    label: {
        display: 'block',
        paddingTop: tokens.spacingVerticalXXS,
        paddingBottom: tokens.spacingVerticalXXS,
        marginBottom: tokens.spacingVerticalXXS,
    },

    container: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
    },

    row: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
    },
});
