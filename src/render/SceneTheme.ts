import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';

export const COLOR_RED = '#ff0000';
export const COLOR_ORANGE = '#fc972b';
export const COLOR_YELLOW = '#ffc800';
export const COLOR_GREEN = '#00e622';
export const COLOR_CYAN = '#00d5e8';
export const COLOR_BLUE = '#0066ff';
export const COLOR_VIOLET = '#8b57fa'; // violet
export const COLOR_PINK = '#f269ff'; // pink
export const COLOR_FUSCHIA = '#bf00ff'; // fuschia
export const COLOR_BLUE_WHITE = '#bae3ff'; // blue-white
export const COLOR_DARK_PURPLE = '#20052e'; // dark purple
export const COLOR_WHITE = '#ffffff'; // white
export const COLOR_BLACK = '#000000'; // black
export const COLOR_GRID = '#6f5a48'; // grid

export const DEFAULT_AOE_COLOR = COLOR_ORANGE;

export const DEFAULT_AOE_OPACITY = 35;
export const COLOR_SWATCHES = [
    COLOR_RED,
    COLOR_ORANGE,
    COLOR_YELLOW,
    COLOR_GREEN,
    COLOR_CYAN,
    COLOR_BLUE,
    COLOR_VIOLET,
    COLOR_PINK,
    COLOR_FUSCHIA,
    COLOR_BLUE_WHITE,
    COLOR_DARK_PURPLE,
    COLOR_WHITE,
    COLOR_BLACK,
    COLOR_GRID,
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

export const ARENA_BACKGROUND_COLOR = '#40352c';
export const ARENA_TEXT_COLOR = '#ffffff';

export function useSceneTheme(): SceneTheme {
    return {
        arena: {
            fill: ARENA_BACKGROUND_COLOR,
            stroke: COLOR_GRID,
            strokeWidth: 1,
        },
        grid: {
            stroke: COLOR_GRID,
            strokeWidth: 1,
        },
        enemy: {
            opacity: 0.75,
            ringShadowOpacity: 0.5,
            text: {
                fill: ARENA_TEXT_COLOR,
                stroke: ARENA_BACKGROUND_COLOR,
            },
        },
    };
}
