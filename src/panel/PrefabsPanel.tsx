import { Tab, TabList, Text, useArrowNavigationGroup, useFocusableGroup } from '@fluentui/react-components';
import React, { useState } from 'react';
import { HotkeyName } from '../HotkeyName';
import { MarkerArrow } from '../prefabs/Arrow';
import { EnemyLarge, EnemyMedium, EnemySmall, EnemyUnremarkable } from '../prefabs/Enemies';
import { Waymark1, Waymark2, Waymark3, Waymark4, WaymarkA, WaymarkB, WaymarkC, WaymarkD } from '../prefabs/Markers';
import {
    PartyAny,
    PartyAstrologian,
    PartyBard,
    PartyBarrierHealer,
    PartyBeastmaster,
    PartyBlackMage,
    PartyBlueMage,
    PartyDancer,
    PartyDarkKnight,
    PartyDps,
    PartyDps1,
    PartyDps2,
    PartyDps3,
    PartyDps4,
    PartyDragoon,
    PartyGunbreaker,
    PartyHealer,
    PartyHealer1,
    PartyHealer2,
    PartyMachinist,
    PartyMagicRanged,
    PartyMelee,
    PartyMelee1,
    PartyMelee2,
    PartyMonk,
    PartyNinja,
    PartyPaladin,
    PartyPhysicalRanged,
    PartyPictomancer,
    PartyPureHealer,
    PartyRanged,
    PartyRanged1,
    PartyRanged2,
    PartyReaper,
    PartyRedMage,
    PartySage,
    PartySamurai,
    PartyScholar,
    PartySummoner,
    PartySupport,
    PartyTank,
    PartyTank1,
    PartyTank2,
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
import { TabActivity } from '../TabActivity';
import { useControlStyles } from '../useControlStyles';
import type { PartyTabs } from './PartyTabContext';
import { ObjectGroup, Section } from './Section';

export const PrefabsPanel: React.FC = () => {
    const controlClasses = useControlStyles();
    const [tab, setTab] = useState<PartyTabs>('roles');
    const attributes = useArrowNavigationGroup({ axis: 'grid-linear' });
    const tabGroup = useFocusableGroup();

    return (
        <div className={controlClasses.panel} {...attributes}>
            <Section header="Zones">
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

            <Section header="Waymarks">
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
            <Section
                header={
                    <TabList
                        size="small"
                        selectedValue={tab}
                        onTabSelect={(ev, data) => setTab(data.value as PartyTabs)}
                        {...tabGroup}
                    >
                        <Tab value="roles">Roles</Tab>
                        <Tab value="jobs">Jobs</Tab>
                    </TabList>
                }
                dividerClassName={controlClasses.dividerWithTabs}
            >
                <TabActivity value="roles" activeTab={tab}>
                    <ObjectGroup>
                        <PartySupport />
                        <PartyAny />
                    </ObjectGroup>
                    <ObjectGroup>
                        <PartyTank1 />
                        <PartyTank2 />
                        <PartyTank />
                    </ObjectGroup>

                    <ObjectGroup>
                        <PartyPureHealer />
                        <PartyBarrierHealer />
                        <PartyHealer1 />
                        <PartyHealer2 />
                        <PartyHealer />
                    </ObjectGroup>

                    <ObjectGroup>
                        <PartyDps1 />
                        <PartyDps2 />
                        <PartyDps3 />
                        <PartyDps4 />
                        <PartyDps />
                    </ObjectGroup>

                    <ObjectGroup>
                        <PartyMelee1 />
                        <PartyMelee2 />
                        <PartyMelee />
                    </ObjectGroup>

                    <ObjectGroup>
                        <PartyPhysicalRanged />
                        <PartyMagicRanged />
                        <PartyRanged1 />
                        <PartyRanged2 />
                        <PartyRanged />
                    </ObjectGroup>
                </TabActivity>
                <TabActivity value="jobs" activeTab={tab}>
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

                    <ObjectGroup>
                        <PartyBeastmaster />
                        <PartyBlueMage />
                    </ObjectGroup>
                </TabActivity>
            </Section>

            <Section header="Enemies">
                <ObjectGroup>
                    <EnemyUnremarkable />
                    <EnemySmall />
                    <EnemyMedium />
                    <EnemyLarge />
                </ObjectGroup>
            </Section>
            <Section header="Tethers">
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
