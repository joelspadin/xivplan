import { IButtonStyles, IStackTokens, IconButton, Label, Stack } from '@fluentui/react';
import React, { useCallback } from 'react';
import { useScene } from '../../SceneProvider';
import { Job, getJob, getJobIconUrl } from '../../jobs';
import { PartyObject } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';

const ICON_CHOICES = [
    [Job.RoleAny, Job.RoleTank, Job.RoleHealer, Job.RoleDps],
    [Job.RoleMagicRanged, Job.RolePhysicalRanged, Job.RoleRanged, Job.RoleMelee],
    [Job.Paladin, Job.Warrior, Job.DarkKnight, Job.Gunbreaker],
    [Job.WhiteMage, Job.Scholar, Job.Astrologian, Job.Sage],
    [Job.Monk, Job.Dragoon, Job.Ninja, Job.Samurai, Job.Reaper],
    [Job.Bard, Job.Machinist, Job.Dancer, Job.BlackMage, Job.Summoner, Job.RedMage],
].map((row) => row.map((job) => getJob(job)));

const buttonStyles: IButtonStyles = {
    icon: {
        fontSize: 32,
        height: 32,
        lineHeight: 32,
    },
};

const stackTokens: IStackTokens = {
    childrenGap: 2,
    padding: '1px 0',
};

export const PartyIconControl: React.FC<PropertiesControlProps<PartyObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const onClick = useCallback(
        (name: string, image: string) =>
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, name, image })) }),
        [dispatch, objects],
    );

    return (
        <div>
            <Label>Variant</Label>
            {ICON_CHOICES.map((row, i) => (
                <Stack horizontal key={i} tokens={stackTokens}>
                    {row.map((job, j) => {
                        const icon = getJobIconUrl(job.icon);
                        return (
                            <IconButton
                                key={j}
                                title={job.name}
                                iconProps={{ imageProps: { src: icon } }}
                                styles={buttonStyles}
                                onClick={() => onClick(job.name, icon)}
                            />
                        );
                    })}
                </Stack>
            ))}
        </div>
    );
};
