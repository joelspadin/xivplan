import type { Enum } from './util';

export interface JobProps {
    name: string;
    icon: string;
}

export const Job = {
    RoleAny: 0,
    RoleTank: 1,
    RoleHealer: 2,
    RoleSupport: 3,
    RoleDps: 4,
    RoleMelee: 5,
    RoleRanged: 6,
    RoleMagicRanged: 7,
    RolePhysicalRanged: 8,
    Paladin: 9,
    Warrior: 10,
    DarkKnight: 11,
    Gunbreaker: 12,
    WhiteMage: 13,
    Scholar: 14,
    Astrologian: 15,
    Monk: 16,
    Dragoon: 17,
    Ninja: 18,
    Viper: 19,
    Reaper: 20,
    Sage: 21,
    Samurai: 22,
    Bard: 23,
    Machinist: 24,
    Dancer: 25,
    BlackMage: 26,
    Summoner: 27,
    RedMage: 28,
    Pictomancer: 29,
    BlueMage: 30,
} as const;
export type Job = Enum<typeof Job>;

const JOBS: Record<Job, JobProps> = {
    [Job.RoleAny]: { name: 'Any player', icon: 'any.png' },
    [Job.RoleTank]: { name: 'Tank', icon: 'tank.png' },
    [Job.RoleHealer]: { name: 'Healer', icon: 'healer.png' },
    [Job.RoleSupport]: { name: 'Support', icon: 'support.png' },
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
    [Job.Viper]: { name: 'Viper', icon: 'VPR.png' },
    [Job.Reaper]: { name: 'Reaper', icon: 'RPR.png' },
    [Job.Samurai]: { name: 'Samurai', icon: 'SAM.png' },
    [Job.Bard]: { name: 'Bard', icon: 'BRD.png' },
    [Job.Machinist]: { name: 'Machinist', icon: 'MCH.png' },
    [Job.Dancer]: { name: 'Dancer', icon: 'DNC.png' },
    [Job.BlackMage]: { name: 'Black Mage', icon: 'BLM.png' },
    [Job.Summoner]: { name: 'Summoner', icon: 'SMN.png' },
    [Job.RedMage]: { name: 'Red Mage', icon: 'RDM.png' },
    [Job.Pictomancer]: { name: 'Pictomancer', icon: 'PCT.png' },
    [Job.BlueMage]: { name: 'Blue Mage', icon: 'BLU.png' },
};

export function getJob(job: Job): JobProps {
    const props = JOBS[job];
    if (props === undefined) {
        throw new Error('Unknown job');
    }

    return props;
}

export function getJobIconUrl(icon: string): string {
    return `/actor/${icon}`;
}
