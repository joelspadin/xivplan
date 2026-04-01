import type { Enum } from './util';

export const EditMode = {
    Normal: 'normal',
    Draw: 'draw',
    Tether: 'tether',
    SelectConnection: 'select-connection',
} as const;
export type EditMode = Enum<typeof EditMode>;
