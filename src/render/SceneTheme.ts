import { ColorSwatchProps } from '@fluentui/react-components';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import { useContext } from 'react';
import { DarkModeContext } from '../ThemeContext';

export const MIN_STAGE_WIDTH = '400px';

/**
 * Radius of a dot to display when editing an object that is centered on a point.
 */
export const CENTER_DOT_RADIUS = 3;

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
export const COLOR_BACKGROUND = '#292929'; // background

export const COLOR_TICK_MAJOR_LIGHT = 'rgb(32 5 46%)';
export const COLOR_TICK_MINOR_LIGHT = 'rgb(32 5 46 / 67%)';
export const COLOR_TICK_MAJOR_DARK = 'rgb(186 227 255)';
export const COLOR_TICK_MINOR_DARK = 'rgb(186 227 255 / 67%)';

export const COLOR_MARKER_RED = '#f13b66';
export const COLOR_MARKER_YELLOW = '#e1dc5d';
export const COLOR_MARKER_BLUE = '#65b3ea';
export const COLOR_MARKER_PURPLE = '#e291e6';
export const DEFAULT_MARKER_OPACITY = 100;

export const DEFAULT_PARTY_OPACITY = 100;

export const DEFAULT_IMAGE_OPACITY = 100;

export const DEFAULT_AOE_COLOR = COLOR_ORANGE;

export const DEFAULT_AOE_OPACITY = 35;

export function makeColorSwatch(color: string, label: string): ColorSwatchProps {
    return { color, value: color, 'aria-label': label };
}

export const COLOR_SWATCHES: ColorSwatchProps[] = [
    makeColorSwatch(COLOR_RED, 'red'),
    makeColorSwatch(COLOR_ORANGE, 'orange'),
    makeColorSwatch(COLOR_YELLOW, 'yellow'),
    makeColorSwatch(COLOR_GREEN, 'green'),
    makeColorSwatch(COLOR_CYAN, 'cyan'),
    makeColorSwatch(COLOR_BLUE, 'blue'),
    makeColorSwatch(COLOR_VIOLET, 'violet'),
    makeColorSwatch(COLOR_PINK, 'pink'),
    makeColorSwatch(COLOR_FUSCHIA, 'fuschia'),
    makeColorSwatch(COLOR_BLUE_WHITE, 'blueish-white'),
    makeColorSwatch(COLOR_DARK_PURPLE, 'dark-purple'),
    makeColorSwatch(COLOR_WHITE, 'white'),
    makeColorSwatch(COLOR_BLACK, 'black'),
    makeColorSwatch(COLOR_GRID, 'brown'),
    makeColorSwatch(COLOR_BACKGROUND, 'background'),
];

export const DEFAULT_ENEMY_COLOR = '#ff0000';
export const DEFAULT_ENEMY_OPACITY = 65;

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

export interface TickTheme {
    major: string;
    minor: string;
}

export interface EnemyTheme {
    text: Partial<Konva.TextConfig>;
}

export interface SceneTheme {
    arena: ArenaTheme;
    grid: GridTheme;
    ticks: TickTheme;
    enemy: EnemyTheme;
}

export const ARENA_BACKGROUND_COLOR = '#40352c';
export const ARENA_TEXT_COLOR = '#ffffff';

const SCENE_THEME: SceneTheme = {
    arena: {
        fill: ARENA_BACKGROUND_COLOR,
        stroke: COLOR_GRID,
        strokeWidth: 1,
    },
    grid: {
        stroke: COLOR_GRID,
        strokeWidth: 1,
    },
    ticks: {
        major: COLOR_TICK_MAJOR_LIGHT,
        minor: COLOR_TICK_MINOR_LIGHT,
    },
    enemy: {
        text: {
            fill: ARENA_TEXT_COLOR,
            stroke: ARENA_BACKGROUND_COLOR,
        },
    },
};

const SCENE_THEME_DARK = {
    ...SCENE_THEME,
    ticks: {
        major: COLOR_TICK_MAJOR_DARK,
        minor: COLOR_TICK_MINOR_DARK,
    },
};

export function useSceneTheme(): SceneTheme {
    const [darkMode] = useContext(DarkModeContext);

    return darkMode ? SCENE_THEME_DARK : SCENE_THEME;
}
