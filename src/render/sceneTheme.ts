import { ColorSwatchProps } from '@fluentui/react-components';
import { ShapeConfig } from 'konva/lib/Shape';
import { TextConfig } from 'konva/lib/shapes/Text';
import { CSSProperties, useContext, useMemo } from 'react';
import { DarkModeContext } from '../ThemeContext';
import { objectMap } from '../util';

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

export const COLOR_MARKER_RED = '#f13b66';
export const COLOR_MARKER_YELLOW = '#e1dc5d';
export const COLOR_MARKER_BLUE = '#65b3ea';
export const COLOR_MARKER_PURPLE = '#e291e6';
export const DEFAULT_MARKER_OPACITY = 100;

export const DEFAULT_PARTY_OPACITY = 100;

export const DEFAULT_IMAGE_OPACITY = 100;

export const DEFAULT_AOE_COLOR = COLOR_ORANGE;
export const DEFAULT_AOE_OPACITY = 35;

export const DEFAULT_ENEMY_COLOR = COLOR_RED;
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

export interface GridTheme {
    stroke: string;
    strokeWidth: number;
}

export interface SceneTheme {
    // Arena shape configs
    arena: ShapeConfig;
    grid: ShapeConfig;
    enemyText: TextConfig;

    // Arena colors
    colorBackground: string;
    colorArena: string;
    colorArenaLight: string;
    colorArenaDark: string;
    colorBorder: string;
    colorBorderTickMajor: string;
    colorBorderTickMinor: string;
    colorGrid: string;

    // Object panel styles
    colorZoneOrange: string;
    colorZoneBlue: string;
    colorZoneEye: string;
    colorMagnetPlus: string;
    colorMagnetPlusSymbol: string;
    colorMagnetMinus: string;
    colorMagnetMinusSymbol: string;
}

const COLOR_ZONE_ORANGE = '#ffa700';
const COLOR_ZONE_BLUE = '#0058ff';
const COLOR_ZONE_EYE = '#ff1200';
const COLOR_MAGNET_PLUS = '#c68200';
const COLOR_MAGNET_MINUS = '#0057f8';
const COLOR_MAGNET_PLUS_SYMBOL = '#000000';
const COLOR_MAGNET_MINUS_SYMBOL = '#ffffff';

const COLOR_ZONE_ORANGE_LIGHT = '#f07900';
const COLOR_ZONE_BLUE_LIGHT = '#0046ff';
const COLOR_ZONE_EYE_LIGHT = '#ff0000';
const COLOR_MAGNET_PLUS_LIGHT = '#c06100';
const COLOR_MAGNET_MINUS_LIGHT = '#0047ff';
const COLOR_MAGNET_PLUS_SYMBOL_LIGHT = '#ffffff';
const COLOR_MAGNET_MINUS_SYMBOL_LIGHT = '#ffffff';

const COLOR_BACKGROUND = '#292929';
const COLOR_ARENA = '#40352c'; // var(--xiv-colorArena, #40352c)
const COLOR_ARENA_LIGHT = '#4c4034'; // var(--xiv-colorArenaLight, #4c4034)
const COLOR_ARENA_DARK = '#352b21'; // var(--xiv-colorArenaDark, #352b21)
const COLOR_GRID = '#6f5a48'; // var(--xiv-colorGrid, #6f5a48)
const COLOR_BORDER = '#6f5a48'; // var(--xiv-colorBorder, #6f5a48)
const COLOR_TEXT = '#ffffff';

const COLOR_TICK_MAJOR = 'rgb(186 227 255)';
const COLOR_TICK_MINOR = 'rgb(186 227 255 / 67%)';

const SCENE_THEME: SceneTheme = {
    arena: {
        fill: COLOR_ARENA,
        stroke: COLOR_BORDER,
        strokeWidth: 1,
    },
    grid: {
        stroke: COLOR_GRID,
        strokeWidth: 1,
    },
    enemyText: {
        fill: COLOR_TEXT,
        stroke: COLOR_ARENA,
    },

    colorBackground: COLOR_BACKGROUND,
    colorArena: COLOR_ARENA,
    colorArenaLight: COLOR_ARENA_LIGHT,
    colorArenaDark: COLOR_ARENA_DARK,
    colorBorder: COLOR_BORDER,
    colorBorderTickMajor: COLOR_TICK_MAJOR,
    colorBorderTickMinor: COLOR_TICK_MINOR,
    colorGrid: COLOR_GRID,

    colorZoneOrange: COLOR_ZONE_ORANGE,
    colorZoneBlue: COLOR_ZONE_BLUE,
    colorZoneEye: COLOR_ZONE_EYE,
    colorMagnetPlus: COLOR_MAGNET_PLUS,
    colorMagnetPlusSymbol: COLOR_MAGNET_PLUS_SYMBOL,
    colorMagnetMinus: COLOR_MAGNET_MINUS,
    colorMagnetMinusSymbol: COLOR_MAGNET_MINUS_SYMBOL,
};

const SCENE_THEME_LIGHT: SceneTheme = {
    ...SCENE_THEME,

    colorZoneOrange: COLOR_ZONE_ORANGE_LIGHT,
    colorZoneBlue: COLOR_ZONE_BLUE_LIGHT,
    colorZoneEye: COLOR_ZONE_EYE_LIGHT,
    colorMagnetPlus: COLOR_MAGNET_PLUS_LIGHT,
    colorMagnetPlusSymbol: COLOR_MAGNET_PLUS_SYMBOL_LIGHT,
    colorMagnetMinus: COLOR_MAGNET_MINUS_LIGHT,
    colorMagnetMinusSymbol: COLOR_MAGNET_MINUS_SYMBOL_LIGHT,
};

export const sceneVars = {
    colorBackground: '--xiv-colorBackground',
    colorArena: '--xiv-colorArena',
    colorArenaLight: '--xiv-colorArenaLight',
    colorArenaDark: '--xiv-colorArenaDark',
    colorBorder: '--xiv-colorBorder',
    colorBorderTickMinor: '--xiv-colorBorderTickMinor',
    colorBorderTickMajor: '--xiv-colorBorderTickMajor',
    colorGrid: '--xiv-colorGrid',
    colorZoneOrange: '--xiv-colorZoneOrange',
    colorZoneBlue: '--xiv-colorZoneBlue',
    colorZoneEye: '--xiv-colorZoneEye',
    colorMagnetPlus: '--xiv-colorMagnetPlus',
    colorMagnetMinus: '--xiv-colorMagnetMinus',
    colorMagnetPlusSymbol: '--xiv-colorMagnetPlusSymbol',
    colorMagnetMinusSymbol: '--xiv-colorMagnetMinusSymbol',
};

export const sceneTokens = objectMap(sceneVars, (_, value) => `var(${value})`);

export function useSceneTheme(): SceneTheme {
    const [darkMode] = useContext(DarkModeContext);

    return darkMode ? SCENE_THEME : SCENE_THEME_LIGHT;
}

/**
 * Gets the CSS variable definitions for the scene theme
 */
export function useSceneThemeStyles(): CSSProperties {
    const theme = useSceneTheme();

    return useMemo(
        () =>
            ({
                [sceneVars.colorBackground]: theme.colorBackground,
                [sceneVars.colorArena]: theme.colorArena,
                [sceneVars.colorArenaLight]: theme.colorArenaLight,
                [sceneVars.colorArenaDark]: theme.colorArenaDark,
                [sceneVars.colorBorder]: theme.colorBorder,
                [sceneVars.colorBorderTickMinor]: theme.colorBorderTickMajor,
                [sceneVars.colorBorderTickMajor]: theme.colorBorderTickMinor,
                [sceneVars.colorGrid]: theme.colorGrid,
                [sceneVars.colorZoneOrange]: theme.colorZoneOrange,
                [sceneVars.colorZoneBlue]: theme.colorZoneBlue,
                [sceneVars.colorZoneEye]: theme.colorZoneEye,
                [sceneVars.colorMagnetPlus]: theme.colorMagnetPlus,
                [sceneVars.colorMagnetPlusSymbol]: theme.colorMagnetPlusSymbol,
                [sceneVars.colorMagnetMinus]: theme.colorMagnetMinus,
                [sceneVars.colorMagnetMinusSymbol]: theme.colorMagnetMinusSymbol,
            } as CSSProperties),
        [theme],
    );
}

/**
 * Gets the CSS variable definitions for the scene theme as a string that can be inserted in an HTML stylesheet.
 */
export function useSceneThemeHtmlStyles(selector = ':root'): string {
    const styles = useSceneThemeStyles();
    return useMemo(() => {
        const vars = (Object.keys(styles) as (keyof typeof styles)[]).reduce((result, cssVar) => {
            return `${result}${cssVar}: ${styles[cssVar]}; `;
        }, '');

        return `${selector} {${vars}}`;
    }, [styles, selector]);
}

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
    makeColorSwatch(COLOR_ARENA, 'dark-brown'),
    makeColorSwatch(COLOR_BACKGROUND, 'background'),
];
