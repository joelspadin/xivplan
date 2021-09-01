import * as React from 'react';
import { PrefabIcon } from './PrefabIcon';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => <PrefabIcon name={name} icon={new URL(`../assets/actor/${icon}`, import.meta.url).toString()} />;
}

export const PartyTank = makeIcon('Tank', 'tank.png');
export const PartyHealer = makeIcon('Healer', 'healer.png');
export const PartyDps = makeIcon('DPS', 'dps.png');
export const PartyAny = makeIcon('Any player', 'any.png');

export const PartyMelee = makeIcon('Melee DPS', 'melee.png');
export const PartyRanged = makeIcon('Ranged DPS', 'ranged.png');
export const PartyMagicRanged = makeIcon('Magic ranged DPS', 'magic_ranged.png');
export const PartyPhysicalRanged = makeIcon('Physical ranged DPS', 'physical_ranged.png');

export const PartyPaladin = makeIcon('Paladin', 'pld.png');
export const PartyWarrior = makeIcon('Warrior', 'war.png');
export const PartyDarkKnight = makeIcon('Dark Knight', 'drk.png');
export const PartyGunbreaker = makeIcon('Gunbreaker', 'gnb.png');

export const PartyWhiteMage = makeIcon('White Mage', 'whm.png');
export const PartyScholar = makeIcon('Scholar', 'sch.png');
export const PartyAstrologian = makeIcon('Astrologian', 'ast.png');

export const PartyMonk = makeIcon('Monk', 'mnk.png');
export const PartyDragoon = makeIcon('Dragoon', 'drg.png');
export const PartyNinja = makeIcon('Ninja', 'nin.png');
export const PartySamurai = makeIcon('Samurai', 'sam.png');

export const PartyBard = makeIcon('Bard', 'brd.png');
export const PartyMachinist = makeIcon('Machinist', 'mch.png');
export const PartyDancer = makeIcon('Dancer', 'dnc.png');

export const PartyBlackMage = makeIcon('Black Mage', 'blm.png');
export const PartySummoner = makeIcon('Summoner', 'smn.png');
export const PartyRedMage = makeIcon('Red Mage', 'rdm.png');

export const EnemySmall = makeIcon('Small enemy', 'enemy_small.png');
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.png');
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.png');
export const EnemyHuge = makeIcon('Huge enemy', 'enemy_huge.png');
