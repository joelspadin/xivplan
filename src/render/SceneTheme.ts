import Konva from 'konva';

export const DEFAULT_AOE_COLOR = '#fc972b';
export const DEFAULT_AOE_OPACITY = 35;
export const AOE_COLOR_SWATCHES = [
    DEFAULT_AOE_COLOR,
    '#ff0000',
    '#00e622',
    '#00d5e8',
    '#0066ff',
    '#f269ff',
    '#bae3ff',
    '#20052e',
];

export const DEFAULT_ENEMY_COLOR = '#ff0000';

export interface ArenaTheme {
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface GridTheme {
    stroke: string;
    strokeWidth: number;
}

export interface EnemyTheme {
    opacity: number;
    ringShadowOpacity: number;
    text: Partial<Konva.TextConfig>;
}

export interface SceneTheme {
    arena: ArenaTheme;
    grid: GridTheme;
    enemy: EnemyTheme;
}

const BACKGROUND = '#40352c';
const FOREGROUND = '#ffffff';
const GRID = '#6F5A48';

export function useSceneTheme(): SceneTheme {
    return {
        arena: {
            fill: BACKGROUND,
            stroke: GRID,
            strokeWidth: 1,
        },
        grid: {
            stroke: GRID,
            strokeWidth: 1,
        },
        enemy: {
            opacity: 0.75,
            ringShadowOpacity: 0.5,
            text: {
                fill: FOREGROUND,
                stroke: BACKGROUND,
            },
        },
    };
}
