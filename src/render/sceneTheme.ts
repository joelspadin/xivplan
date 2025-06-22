import { ColorSwatchProps } from '@fluentui/react-components';
import { ShapeConfig } from 'konva/lib/Shape';
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

export interface SceneTheme {
    // Arena colors
    colorBackground: string;
    colorArena: string;
    colorArenaLight: string;
    colorArenaDark: string;
    colorBorder: string;
    colorBorderTickMajor: string;
    colorBorderTickMinor: string;
    colorGrid: string;
    colorEnemyText: string;

    // Object panel styles
    colorZoneOrange: string;
    colorZoneBlue: string;
    colorZoneEye: string;
    colorMagnetPlus: string;
    colorMagnetPlusSymbol: string;
    colorMagnetMinus: string;
    colorMagnetMinusSymbol: string;
}

const sceneTheme: SceneTheme = {
    colorBackground: '#292929',
    colorArena: '#40352c', // var(--xiv-colorArena, #40352c)
    colorArenaLight: '#4c4034', // var(--xiv-colorArenaLight, #4c4034)
    colorArenaDark: '#352b21', // var(--xiv-colorArenaDark, #352b21)
    colorBorder: '#6f5a48', // var(--xiv-colorBorder, #6f5a48)
    colorBorderTickMajor: 'rgb(186 227 255)',
    colorBorderTickMinor: 'rgb(186 227 255 / 67%)',
    colorGrid: '#6f5a48', // var(--xiv-colorGrid, #6f5a48)
    colorEnemyText: '#ffffff',

    colorZoneOrange: '#ffa700',
    colorZoneBlue: '#0058ff',
    colorZoneEye: '#ff1200',
    colorMagnetPlus: '#c68200',
    colorMagnetPlusSymbol: '#000000',
    colorMagnetMinus: '#0057f8',
    colorMagnetMinusSymbol: '#ffffff',
};

const sceneThemeLight: SceneTheme = {
    ...sceneTheme,

    colorZoneOrange: '#f07900',
    colorZoneBlue: '#0046ff',
    colorZoneEye: '#ff0000',
    colorMagnetPlus: '#c06100',
    colorMagnetPlusSymbol: '#ffffff',
    colorMagnetMinus: '#0047ff',
    colorMagnetMinusSymbol: '#ffffff',
};

export const sceneVars: Record<keyof SceneTheme, `--${string}`> = objectMap(
    sceneTheme,
    (key) => `--xiv-${key}` as `--${string}`,
);
export const sceneTokens: Record<keyof SceneTheme, string> = objectMap(sceneVars, (_, value) => `var(${value})`);

export function useSceneTheme(): SceneTheme {
    const [darkMode] = useContext(DarkModeContext);

    return darkMode ? sceneTheme : sceneThemeLight;
}

/**
 * Gets the CSS variable definitions for the scene theme
 */
export function useSceneThemeStyles(): CSSProperties {
    const theme = useSceneTheme();

    return useMemo(
        () =>
            Object.fromEntries(
                (Object.entries(sceneVars) as [keyof SceneTheme, string][]).map(([key, name]) => {
                    return [name, theme[key]];
                }),
            ),
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

export function getArenaShapeConfig(theme: SceneTheme): ShapeConfig {
    return {
        fill: theme.colorArena,
        stroke: theme.colorBorder,
        strokeWidth: 1,
    };
}

export function getGridShapeConfig(theme: SceneTheme): ShapeConfig {
    return {
        stroke: theme.colorGrid,
        strokeWidth: 1,
    };
}

export function getEnemyTextConfig(theme: SceneTheme): ShapeConfig {
    return {
        fill: theme.colorEnemyText,
        stroke: theme.colorArena,
    };
}

export function makeColorSwatch(color: string, label: string): ColorSwatchProps {
    return { color, value: color, 'aria-label': label };
}

export function useColorSwatches(): ColorSwatchProps[] {
    const theme = useSceneTheme();

    return useMemo(
        () => [
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
            makeColorSwatch(theme.colorGrid, 'grid'),
            makeColorSwatch(theme.colorArena, 'arena'),
            makeColorSwatch(theme.colorBackground, 'background'),
        ],
        [theme],
    );
}
