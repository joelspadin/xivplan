import { IButtonStyles, IconButton, IStackTokens, Label, Stack } from '@fluentui/react';
import * as React from 'react';
import { useCallback } from 'react';
import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { DeferredTextField } from '../DeferredTextField';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesControlRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { SELECTED_PROPS } from '../render/SceneTheme';
import { ObjectType, PartyObject } from '../scene';
import { useScene } from '../SceneProvider';
import { usePanelDrag } from '../usePanelDrag';
import { ImageObjectProperties } from './CommonProperties';
import { useShowHighlight } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';

const DEFAULT_SIZE = 32;

interface JobProps {
    name: string;
    icon: string;
}

enum Job {
    RoleAny,
    RoleTank,
    RoleHealer,
    RoleDps,
    RoleMelee,
    RoleRanged,
    RoleMagicRanged,
    RolePhysicalRanged,
    Paladin,
    Warrior,
    DarkKnight,
    Gunbreaker,
    WhiteMage,
    Scholar,
    Astrologian,
    Monk,
    Dragoon,
    Ninja,
    Reaper,
    Sage,
    Samurai,
    Bard,
    Machinist,
    Dancer,
    BlackMage,
    Summoner,
    RedMage,
}

const JOBS: Record<Job, JobProps> = {
    [Job.RoleAny]: { name: 'Any player', icon: 'any.png' },
    [Job.RoleTank]: { name: 'Tank', icon: 'tank.png' },
    [Job.RoleHealer]: { name: 'Healer', icon: 'healer.png' },
    [Job.RoleDps]: { name: 'DPS', icon: 'dps.png' },
    [Job.RoleMelee]: { name: 'Melee DPS', icon: 'melee.png' },
    [Job.RoleRanged]: { name: 'Ranged DPS', icon: 'ranged.png' },
    [Job.RoleMagicRanged]: { name: 'Magic Ranged DPS', icon: 'magic_ranged.png' },
    [Job.RolePhysicalRanged]: { name: 'Physical Ranged DPS', icon: 'physical_ranged.png' },
    [Job.Paladin]: { name: 'Paladin', icon: 'PLD.png' },
    [Job.Warrior]: { name: 'Warrior', icon: 'WAR.png' },
    [Job.DarkKnight]: { name: 'Dark Knight', icon: 'DRK.png' },
    [Job.Gunbreaker]: { name: 'Gunbreaker', icon: 'GNB.png' },
    [Job.WhiteMage]: { name: 'White Mage', icon: 'WHM.png' },
    [Job.Scholar]: { name: 'Scholar', icon: 'SCH.png' },
    [Job.Astrologian]: { name: 'Astrologian', icon: 'AST.png' },
    [Job.Sage]: { name: 'Sage', icon: 'SGE.png' },
    [Job.Monk]: { name: 'Monk', icon: 'MNK.png' },
    [Job.Dragoon]: { name: 'Dragoon', icon: 'DRG.png' },
    [Job.Ninja]: { name: 'Ninja', icon: 'NIN.png' },
    [Job.Reaper]: { name: 'Reaper', icon: 'RPR.png' },
    [Job.Samurai]: { name: 'Samurai', icon: 'SAM.png' },
    [Job.Bard]: { name: 'Bard', icon: 'BRD.png' },
    [Job.Machinist]: { name: 'Machinist', icon: 'MCH.png' },
    [Job.Dancer]: { name: 'Dancer', icon: 'DNC.png' },
    [Job.BlackMage]: { name: 'Black Mage', icon: 'BLM.png' },
    [Job.Summoner]: { name: 'Summoner', icon: 'SMN.png' },
    [Job.RedMage]: { name: 'Red Mage', icon: 'RDM.png' },
};

function getJob(job: Job) {
    const props = JOBS[job];
    if (!props) {
        throw new Error('Unknown job');
    }
    return props;
}

function getIconUrl(icon: string) {
    return `/actor/${icon}`;
}

function makeIcon(job: Job) {
    const { icon, name } = getJob(job);

    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = getIconUrl(icon);

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Party,
                            image: iconUrl,
                            name,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

registerDropHandler<PartyObject>(ObjectType.Party, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Party,
            image: '',
            name: '',
            status: [],
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const PartyRenderer: React.FC<RendererProps<PartyObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [image] = useImage(object.image);

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {showHighlight && (
                        <Rect
                            width={object.width}
                            height={object.height}
                            cornerRadius={(object.width + object.height) / 2 / 5}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <Image image={image} width={object.width} height={object.height} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<PartyObject>(ObjectType.Party, LayerName.Default, PartyRenderer);

const PartyDetails: React.FC<ListComponentProps<PartyObject>> = ({ object, isNested }) => {
    return <DetailsItem icon={object.image} name={object.name} object={object} isNested={isNested} />;
};

registerListComponent<PartyObject>(ObjectType.Party, PartyDetails);

const iconChoices = [
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

const PartyIconSelect: React.FC<PropertiesControlProps<PartyObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onClick = useCallback(
        (name: string, image: string) => dispatch({ type: 'update', value: { ...object, name, image } }),
        [dispatch, object],
    );

    return (
        <div>
            <Label>Variant</Label>
            {iconChoices.map((row, i) => (
                <Stack horizontal key={i} tokens={stackTokens}>
                    {row.map((job, j) => {
                        const icon = getIconUrl(job.icon);
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

const PartyEditControl: React.FC<PropertiesControlProps<PartyObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onNameChanged = useCallback(
        (newName?: string) => dispatch({ type: 'update', value: { ...object, name: newName ?? '' } }),
        [dispatch, object],
    );

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />
            <ImageObjectProperties object={object} />
            <PartyIconSelect object={object} />
        </Stack>
    );
};

registerPropertiesControl<PartyObject>(ObjectType.Party, PartyEditControl);

export const PartyAny = makeIcon(Job.RoleAny);
export const PartyTank = makeIcon(Job.RoleTank);
export const PartyHealer = makeIcon(Job.RoleHealer);
export const PartyDps = makeIcon(Job.RoleDps);

export const PartyMelee = makeIcon(Job.RoleMelee);
export const PartyRanged = makeIcon(Job.RoleRanged);
export const PartyMagicRanged = makeIcon(Job.RoleMagicRanged);
export const PartyPhysicalRanged = makeIcon(Job.RolePhysicalRanged);

export const PartyPaladin = makeIcon(Job.Paladin);
export const PartyWarrior = makeIcon(Job.Warrior);
export const PartyDarkKnight = makeIcon(Job.DarkKnight);
export const PartyGunbreaker = makeIcon(Job.Gunbreaker);

export const PartyWhiteMage = makeIcon(Job.WhiteMage);
export const PartyScholar = makeIcon(Job.Scholar);
export const PartyAstrologian = makeIcon(Job.Astrologian);
export const PartySage = makeIcon(Job.Sage);

export const PartyMonk = makeIcon(Job.Monk);
export const PartyDragoon = makeIcon(Job.Dragoon);
export const PartyNinja = makeIcon(Job.Ninja);
export const PartySamurai = makeIcon(Job.Samurai);
export const PartyReaper = makeIcon(Job.Reaper);

export const PartyBard = makeIcon(Job.Bard);
export const PartyMachinist = makeIcon(Job.Machinist);
export const PartyDancer = makeIcon(Job.Dancer);
export const PartyBlackMage = makeIcon(Job.BlackMage);
export const PartySummoner = makeIcon(Job.Summoner);
export const PartyRedMage = makeIcon(Job.RedMage);
