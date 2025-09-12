import { Button, Image, Label, makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { Job, getJob, getJobIconUrl } from '../../jobs';
import { PartyObject } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';

const ICON_CHOICES = [
    [Job.RoleSupport, Job.RoleTank, Job.RoleHealer, Job.RoleDps, Job.RoleAny],
    [Job.RoleMelee, Job.RoleRanged, Job.RoleMagicRanged, Job.RolePhysicalRanged],
    [Job.Paladin, Job.Warrior, Job.DarkKnight, Job.Gunbreaker],
    [Job.WhiteMage, Job.Scholar, Job.Astrologian, Job.Sage],
    [Job.Monk, Job.Dragoon, Job.Samurai, Job.Reaper, Job.Ninja, Job.Viper],
    [Job.BlackMage, Job.Summoner, Job.RedMage, Job.Pictomancer, Job.BlueMage],
    [Job.Bard, Job.Machinist, Job.Dancer],
].map((row) => row.map((job) => getJob(job)));

export const PartyIconControl: React.FC<PropertiesControlProps<PartyObject>> = ({ objects }) => {
    const classes = useStyles();
    const { dispatch } = useScene();

    const onClick = (name: string, image: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, name, image })) });

    return (
        <div>
            <Label className={classes.label}>Variant</Label>
            <div className={classes.container}>
                {ICON_CHOICES.map((row, i) => (
                    <div key={i} className={classes.row}>
                        {row.map((job, j) => {
                            const icon = getJobIconUrl(job.icon);
                            return (
                                <Button
                                    key={j}
                                    appearance="transparent"
                                    title={job.name}
                                    icon={<Image src={icon} width={32} height={32} />}
                                    onClick={() => onClick(job.name, icon)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
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
    },

    row: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
    },
});
