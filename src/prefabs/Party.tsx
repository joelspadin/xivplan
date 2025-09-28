import { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { getJob, getJobIconUrl, Job } from '../jobs';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { ObjectType, PartyObject } from '../scene';
import { DEFAULT_PARTY_OPACITY, SELECTED_PROPS } from '../theme';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { useShowHighlight } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';

const DEFAULT_SIZE = 32;

function makeIcon(job: Job) {
    const { icon, name } = getJob(job);

    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = getJobIconUrl(icon);
        const { t } = useTranslation();
        const Tname = SwitchName(name, t);

        return (
            <PrefabIcon
                draggable
                name={Tname}
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
    Component.displayName = makeDisplayName(name);
    return Component;
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
            opacity: DEFAULT_PARTY_OPACITY,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const PartyRenderer: React.FC<RendererProps<PartyObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [image] = useImageTracked(object.image);

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
                    <HideGroup>
                        <Image
                            image={image}
                            width={object.width}
                            height={object.height}
                            opacity={object.opacity / 100}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<PartyObject>(ObjectType.Party, LayerName.Default, PartyRenderer);

const PartyDetails: React.FC<ListComponentProps<PartyObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const Tname = SwitchName(object.name, t);
    return <DetailsItem icon={object.image} name={Tname} object={object} {...props} />;
};

registerListComponent<PartyObject>(ObjectType.Party, PartyDetails);

export const PartyAny = makeIcon(Job.RoleAny);
export const PartyTank = makeIcon(Job.RoleTank);
export const PartyHealer = makeIcon(Job.RoleHealer);
export const PartySupport = makeIcon(Job.RoleSupport);
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
export const PartyViper = makeIcon(Job.Viper);
export const PartySamurai = makeIcon(Job.Samurai);
export const PartyReaper = makeIcon(Job.Reaper);

export const PartyBard = makeIcon(Job.Bard);
export const PartyMachinist = makeIcon(Job.Machinist);
export const PartyDancer = makeIcon(Job.Dancer);
export const PartyBlackMage = makeIcon(Job.BlackMage);
export const PartySummoner = makeIcon(Job.Summoner);
export const PartyRedMage = makeIcon(Job.RedMage);
export const PartyPictomancer = makeIcon(Job.Pictomancer);

export const PartyBlueMage = makeIcon(Job.BlueMage);
function SwitchName(name: string, t: TFunction<'translation', undefined>) {
    const jobMap: Record<string, string> = {
        'Any player': 'jobs.AnyPlayer',
        Tank: 'jobs.Tank',
        Healer: 'jobs.Healer',
        Support: 'jobs.Support',
        DPS: 'jobs.DPS',
        'Melee DPS': 'jobs.MeleeDPS',
        'Ranged DPS': 'jobs.RangedDPS',
        'Magic Ranged DPS': 'jobs.MagicRangedDPS',
        'Physical Ranged DPS': 'jobs.PhysicalRangedDPS',
        Paladin: 'jobs.Paladin',
        Warrior: 'jobs.Warrior',
        'Dark Knight': 'jobs.DarkKnight',
        Gunbreaker: 'jobs.Gunbreaker',
        'White Mage': 'jobs.WhiteMage',
        Scholar: 'jobs.Scholar',
        Astrologian: 'jobs.Astrologian',
        Sage: 'jobs.Sage',
        Monk: 'jobs.Monk',
        Dragoon: 'jobs.Dragoon',
        Ninja: 'jobs.Ninja',
        Viper: 'jobs.Viper',
        Reaper: 'jobs.Reaper',
        Samurai: 'jobs.Samurai',
        Bard: 'jobs.Bard',
        Machinist: 'jobs.Machinist',
        Dancer: 'jobs.Dancer',
        'Black Mage': 'jobs.BlackMage',
        Summoner: 'jobs.Summoner',
        'Red Mage': 'jobs.RedMage',
        Pictomancer: 'jobs.Pictomancer',
        'Blue Mage': 'jobs.BlueMage',
        'Unknown job': 'jobs.UnknownJob',
    };
    const jobKey = jobMap[name];
    return jobKey ? t(jobKey) : '';
}
