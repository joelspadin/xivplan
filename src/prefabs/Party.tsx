import * as React from 'react';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { getJob, getJobIconUrl, Job } from '../jobs';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { DEFAULT_PARTY_OPACITY, SELECTED_PROPS } from '../render/SceneTheme';
import { ObjectType, PartyObject } from '../scene';
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
    return <DetailsItem icon={object.image} name={object.name} object={object} {...props} />;
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
