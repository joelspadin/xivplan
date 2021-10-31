import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';

export const DEFAULT_AOE_COLOR = '#fc972b';
export const DEFAULT_AOE_OPACITY = 35;
export const COLOR_SWATCHES = [
    '#ff0000', // red
    DEFAULT_AOE_COLOR, // orange
    '#ffc800', // yellow
    '#00e622', // green
    '#00d5e8', // cyan
    '#0066ff', // blue
    '#8b57fa', // violet
    '#f269ff', // pink
    '#fb00ff', // fuschia
    '#bae3ff', // blue-white
    '#20052e', // dark purple
    '#ffffff', // white
    '#000000', // black
    '#6f5a48', // grid
];

export const DEFAULT_ENEMY_COLOR = '#ff0000';

export const HIGHLIGHT_COLOR = '#fff';
export const HIGHLIGHT_WIDTH = 1.5;

export const SELECTED_PROPS: ShapeConfig = {
    fillEnabled: false,
    listening: false,
    stroke: HIGHLIGHT_COLOR,
    strokeWidth: HIGHLIGHT_WIDTH,
    shadowColor: '#06f',
    shadowBlur: 4,
    opacity: 0.75,
};

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
