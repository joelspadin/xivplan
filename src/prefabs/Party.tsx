import { Stack } from '@fluentui/react';
import * as React from 'react';
import { useCallback } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/LayerItem';
import { registerListComponent } from '../panel/LayerList';
import { registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { useCanvasCoord } from '../render/coord';
import { registerRenderer } from '../render/ObjectRenderer';
import { ObjectType, PartyObject } from '../scene';
import { SceneAction, updateListObject, useScene } from '../SceneProvider';
import { ImageObjectProperties } from './CommonProperties';
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
        type: 'actors',
        op: 'add',
        value: {
            image: '',
            status: [],
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        } as PartyObject,
    } as SceneAction;
});

registerRenderer<PartyObject>(ObjectType.Party, ({ object }) => {
    const [image] = useImage(object.image);
    const center = useCanvasCoord(object);

    return (
        <Image
            image={image}
            x={center.x}
            y={center.y}
            width={object.width}
            height={object.height}
            offsetX={object.width / 2}
            offsetY={object.height / 2}
            rotation={object.rotation}
        />
    );
});

registerListComponent<PartyObject>(ObjectType.Party, ({ object }) => {
    return <DetailsItem icon={object.image} name={object.name} />;
});

registerPropertiesControl<PartyObject>(ObjectType.Party, ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = useCallback(
        (newName?: string) => updateListObject(dispatch, layer, index, { ...object, name: newName ?? '' }),
        [dispatch, object, layer, index],
    );

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />
            <ImageObjectProperties object={object} layer={layer} index={index} />
        </Stack>
    );
});

export const PartyTank = makeIcon('Tank', 'tank.png');
export const PartyHealer = makeIcon('Healer', 'healer.png');
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
