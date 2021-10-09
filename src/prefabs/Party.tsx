import { Stack } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { DefaultPortal } from '../render/Portals';
import { SELECTED_PROPS } from '../render/SceneTheme';
import { ObjectType, PartyObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsSelected } from '../SelectionProvider';
import { ImageObjectProperties } from './CommonProperties';
import { DraggableObject } from './DraggableObject';
import { PrefabIcon } from './PrefabIcon';

const DEFAULT_SIZE = 32;

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = new URL(`../assets/actor/${icon}`, import.meta.url).toString();

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

const PartyRenderer: React.FC<RendererProps<PartyObject>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const [image] = useImage(object.image);

    return (
        <DefaultPortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                {isSelected && (
                    <Rect
                        width={object.width}
                        height={object.height}
                        offsetX={object.width / 2}
                        offsetY={object.height / 2}
                        rotation={object.rotation}
                        cornerRadius={(object.width + object.height) / 2 / 5}
                        {...SELECTED_PROPS}
                    />
                )}

                <Image
                    image={image}
                    width={object.width}
                    height={object.height}
                    offsetX={object.width / 2}
                    offsetY={object.height / 2}
                    rotation={object.rotation}
                />
            </DraggableObject>
        </DefaultPortal>
    );
};

registerRenderer<PartyObject>(ObjectType.Party, PartyRenderer);

const PartyDetails: React.FC<ListComponentProps<PartyObject>> = ({ object, index }) => {
    return <DetailsItem icon={object.image} name={object.name} index={index} />;
};

registerListComponent<PartyObject>(ObjectType.Party, PartyDetails);

const PartyEditControl: React.FC<PropertiesControlProps<PartyObject>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = useCallback(
        (newName?: string) => dispatch({ type: 'update', index, value: { ...object, name: newName ?? '' } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />
            <ImageObjectProperties object={object} index={index} />
        </Stack>
    );
};

registerPropertiesControl<PartyObject>(ObjectType.Party, PartyEditControl);

export const PartyTank = makeIcon('Tank', 'tank.png');
export const PartyHealer = makeIcon('Healer', 'healer.png');
export const PartyTankOrHealer = makeIcon('Tank/healer', 'tank_or_healer.png');
export const PartyDps = makeIcon('DPS', 'dps.png');
export const PartyAny = makeIcon('Any player', 'any.png');

export const PartyMelee = makeIcon('Melee DPS', 'melee.png');
export const PartyRanged = makeIcon('Ranged DPS', 'ranged.png');
export const PartyMagicRanged = makeIcon('Magic ranged DPS', 'magic_ranged.png');
export const PartyPhysicalRanged = makeIcon('Physical ranged DPS', 'physical_ranged.png');

export const PartyPaladin = makeIcon('Paladin', 'PLD.png');
export const PartyWarrior = makeIcon('Warrior', 'WAR.png');
export const PartyDarkKnight = makeIcon('Dark Knight', 'DRK.png');
export const PartyGunbreaker = makeIcon('Gunbreaker', 'GNB.png');

export const PartyWhiteMage = makeIcon('White Mage', 'WHM.png');
export const PartyScholar = makeIcon('Scholar', 'SCH.png');
export const PartyAstrologian = makeIcon('Astrologian', 'AST.png');

export const PartyMonk = makeIcon('Monk', 'MNK.png');
export const PartyDragoon = makeIcon('Dragoon', 'DRG.png');
export const PartyNinja = makeIcon('Ninja', 'NIN.png');
export const PartySamurai = makeIcon('Samurai', 'SAM.png');

export const PartyBard = makeIcon('Bard', 'BRD.png');
export const PartyMachinist = makeIcon('Machinist', 'MCH.png');
export const PartyDancer = makeIcon('Dancer', 'DNC.png');

export const PartyBlackMage = makeIcon('Black Mage', 'BLM.png');
export const PartySummoner = makeIcon('Summoner', 'SMN.png');
export const PartyRedMage = makeIcon('Red Mage', 'RDM.png');
