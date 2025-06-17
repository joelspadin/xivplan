import { Text } from '@fluentui/react-components';
import React from 'react';
import { HotkeyName } from '../HotkeyName';
import { MarkerArrow } from '../prefabs/Arrow';
import { EnemyCircle, EnemyHuge, EnemyLarge, EnemyMedium, EnemySmall } from '../prefabs/Enemies';
import { Waymark1, Waymark2, Waymark3, Waymark4, WaymarkA, WaymarkB, WaymarkC, WaymarkD } from '../prefabs/Markers';
import {
    PartyAny,
    PartyAstrologian,
    PartyBard,
    PartyBlackMage,
    PartyBlueMage,
    PartyDancer,
    PartyDarkKnight,
    PartyDps,
    PartyDragoon,
    PartyGunbreaker,
    PartyHealer,
    PartyMachinist,
    PartyMagicRanged,
    PartyMelee,
    PartyMonk,
    PartyNinja,
    PartyPaladin,
    PartyPhysicalRanged,
    PartyPictomancer,
    PartyRanged,
    PartyReaper,
    PartyRedMage,
    PartySage,
    PartySamurai,
    PartyScholar,
    PartySummoner,
    PartySupport,
    PartyTank,
    PartyViper,
    PartyWarrior,
    PartyWhiteMage,
} from '../prefabs/Party';
import {
    TetherClose,
    TetherFar,
    TetherLine,
    TetherMinusMinus,
    TetherPlusMinus,
    TetherPlusPlus,
} from '../prefabs/Tethers';
import { TextLabel } from '../prefabs/TextLabel';
import { ZoneArc } from '../prefabs/zone/ZoneArc';
import { ZoneCircle } from '../prefabs/zone/ZoneCircle';
import { ZoneCone } from '../prefabs/zone/ZoneCone';
import { ZoneDonut } from '../prefabs/zone/ZoneDonut';
import { ZoneExaflare } from '../prefabs/zone/ZoneExaflare';
import { ZoneEye } from '../prefabs/zone/ZoneEye';
import { ZoneKnockback } from '../prefabs/zone/ZoneKnockback';
import { ZoneLine } from '../prefabs/zone/ZoneLine';
import { ZoneLineKnockAway } from '../prefabs/zone/ZoneLineKnockAway';
import { ZoneLineKnockback } from '../prefabs/zone/ZoneLineKnockback';
import { ZoneLineStack } from '../prefabs/zone/ZoneLineStack';
import { ZonePolygon } from '../prefabs/zone/ZonePolygon';
import { ZoneProximity } from '../prefabs/zone/ZoneProximity';
import { ZoneSquare } from '../prefabs/zone/ZoneRectangle';
import { ZoneRightTriangle } from '../prefabs/zone/ZoneRightTriangle';
import { ZoneRotateClockwise, ZoneRotateCounterClockwise } from '../prefabs/zone/ZoneRotate';
import { ZoneStack } from '../prefabs/zone/ZoneStack';
import { ZoneStarburst } from '../prefabs/zone/ZoneStarburst';
import { ZoneTower } from '../prefabs/zone/ZoneTower';
import { ZoneTriangle } from '../prefabs/zone/ZoneTriangle';
import { useControlStyles } from '../useControlStyles';
import { ObjectGroup, Section } from './Section';

export const PrefabsPanel: React.FC = () => {
    const controlClasses = useControlStyles();

    return (
        <div className={controlClasses.panel}>
            <Section title="Zones">
                <ObjectGroup>
                    <ZoneRightTriangle />
                    <ZoneTriangle />
                    <ZoneSquare />
                    <ZoneLine />
                    <ZoneDonut />
                    <ZoneCircle />

                    <ZoneKnockback />
                    <ZoneProximity />
                    <ZoneLineStack />
                    <ZoneStack />
                    <ZoneArc />
                    <ZoneCone />

                    <ZoneLineKnockback />
                    <ZoneLineKnockAway />
                    <ZoneExaflare />
                    <ZoneStarburst />
                    <ZoneRotateClockwise />
                    <ZoneRotateCounterClockwise />

                    <ZonePolygon />
                    <ZoneTower />
                    <ZoneEye />
                </ObjectGroup>
            </Section>

            <Section title="Waymarks">
                <ObjectGroup>
                    <TextLabel />
                    <MarkerArrow />
                    <WaymarkA />
                    <WaymarkB />
                    <WaymarkC />
                    <WaymarkD />
                </ObjectGroup>
                <ObjectGroup>
                    <Waymark1 />
                    <Waymark2 />
                    <Waymark3 />
                    <Waymark4 />
                </ObjectGroup>
            </Section>
            <Section title="Party">
                <ObjectGroup>
                    <PartySupport />
                    <PartyTank />
                    <PartyHealer />
                    <PartyDps />
                    <PartyAny />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyMelee />
                    <PartyRanged />
                    <PartyMagicRanged />
                    <PartyPhysicalRanged />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyPaladin />
                    <PartyWarrior />
                    <PartyDarkKnight />
                    <PartyGunbreaker />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyWhiteMage />
                    <PartyScholar />
                    <PartyAstrologian />
                    <PartySage />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyMonk />
                    <PartyDragoon />
                    <PartySamurai />
                    <PartyReaper />
                    <PartyNinja />
                    <PartyViper />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyBlueMage />
                    <PartyBlackMage />
                    <PartySummoner />
                    <PartyRedMage />
                    <PartyPictomancer />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyBard />
                    <PartyMachinist />
                    <PartyDancer />
                </ObjectGroup>
            </Section>

            <Section title="Enemies">
                <ObjectGroup>
                    <EnemyCircle />
                    <EnemySmall />
                    <EnemyMedium />
                    <EnemyLarge />
                    <EnemyHuge />
                </ObjectGroup>
            </Section>
            <Section title="Tethers">
                <ObjectGroup>
                    <TetherLine />
                    <TetherClose />
                    <TetherFar />

                    <TetherPlusMinus />
                    <TetherPlusPlus />
                    <TetherMinusMinus />
                </ObjectGroup>
                <Text block size={200} data-nosnippet>
                    Select a tether type, then click two objects to add a tether. Press <HotkeyName keys="esc" /> or
                    unselect the tether button to cancel. Use <HotkeyName keys="ctrl" /> + click to create chains.
                </Text>
            </Section>
        </div>
    );
};
