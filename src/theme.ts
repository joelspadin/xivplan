import { ColorSwatchProps, Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { ShapeConfig } from 'konva/lib/Shape';
import { CSSProperties, useContext } from 'react';
import { DarkModeContext } from './ThemeContext';
import { cssPropertiesToStyleString, themeToCssProperties, themeToCssVars, themeToTokensObject } from './themeUtil';

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

export const HIGHLIGHT_COLOR = '#ffffff';
export const SPOTLIGHT_COLOR = '#ffc800';
export const HIGHLIGHT_WIDTH = 1.5;

export const SELECTED_PROPS: ShapeConfig = {
    fillEnabled: false,
    listening: false,
    stroke: HIGHLIGHT_COLOR,
    strokeWidth: HIGHLIGHT_WIDTH,
    shadowColor: '#0066ff',
    shadowBlur: 4,
    opacity: 0.75,
};

export const SPOTLIGHT_PROPS: ShapeConfig = {
    fillEnabled: false,
    listening: false,
    stroke: SPOTLIGHT_COLOR,
    strokeWidth: HIGHLIGHT_WIDTH,
    shadowColor: '#ffff00',
    shadowBlur: 4,
    opacity: 0.75,
};

export interface SceneTheme {
    colorBackground: string;
    colorArena: string;
    colorArenaLight: string;
    colorArenaDark: string;
    colorGrid: string;
    colorBorder: string;
    colorBorderTickMajor: string;
    colorBorderTickMinor: string;
    colorEnemyText: string;
}

const sceneTheme: SceneTheme = {
    colorBackground: '#292929',
    colorArena: '#40352c', // var(--xiv-colorArena, #40352c)
    colorArenaLight: '#4c4034', // var(--xiv-colorArenaLight, #4c4034)
    colorArenaDark: '#352b21', // var(--xiv-colorArenaDark, #352b21)
    colorGrid: '#6f5a48', // var(--xiv-colorGrid, #6f5a48)
    colorBorder: '#6f5a48', // var(--xiv-colorBorder, #6f5a48)
    colorBorderTickMajor: 'rgb(186 227 255)',
    colorBorderTickMinor: 'rgb(186 227 255 / 67%)',
    colorEnemyText: '#ffffff',
};

export const sceneVars = themeToCssVars(sceneTheme);
export const sceneTokens = themeToTokensObject(sceneTheme);

export function useSceneTheme(): SceneTheme {
    return sceneTheme;
}

/**
 * Gets the CSS variable definitions for the scene theme
 */
export function useSceneThemeStyle(): CSSProperties {
    const theme = useSceneTheme();
    return themeToCssProperties(theme);
}

/**
 * Gets the CSS variable definitions for the scene theme as a string that can be inserted in an HTML stylesheet.
 */
export function useSceneThemeHtmlStyle(selector = ':root'): string {
    const styles = useSceneThemeStyle();
    return cssPropertiesToStyleString(selector, styles);
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

export interface PanelTheme {
    colorZoneOrange: string;
    colorZoneBlue: string;
    colorZoneEye: string;
    colorMagnetPlus: string;
    colorMagnetPlusSymbol: string;
    colorMagnetMinus: string;
    colorMagnetMinusSymbol: string;
}

const darkPanelTheme: PanelTheme = {
    colorZoneOrange: '#ffa700',
    colorZoneBlue: '#0058ff',
    colorZoneEye: '#ff1200',
    colorMagnetPlus: '#c68200',
    colorMagnetPlusSymbol: '#000000',
    colorMagnetMinus: '#0057f8',
    colorMagnetMinusSymbol: '#ffffff',
};

const lightPanelTheme: PanelTheme = {
    colorZoneOrange: '#f07900',
    colorZoneBlue: '#0046ff',
    colorZoneEye: '#ff0000',
    colorMagnetPlus: '#c06100',
    colorMagnetPlusSymbol: '#ffffff',
    colorMagnetMinus: '#0047ff',
    colorMagnetMinusSymbol: '#ffffff',
};

export const panelVars = themeToCssVars(darkPanelTheme);
export const panelTokens = themeToTokensObject(darkPanelTheme);

export function usePanelTheme() {
    const darkMode = useContext(DarkModeContext);

    return darkMode ? darkPanelTheme : lightPanelTheme;
}

/**
 * Gets the CSS variable definitions for the panel theme
 */
export function usePanelThemeStyle(): CSSProperties {
    const theme = usePanelTheme();
    return themeToCssProperties(theme);
}

export function makeColorSwatch(color: string, label: string): ColorSwatchProps {
    return { color, value: color, 'aria-label': label };
}

export function useColorSwatches(): ColorSwatchProps[] {
    const theme = useSceneTheme();

    return [
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
    ];
}

// ==== Fluent UI themes ====

const darkTheme = webDarkTheme;

// Colors adjusted to a more sepia tone that's easier on the eyes and is similar
// to FFXIV's UI light theme.
const lightTheme: Theme = {
    ...webLightTheme,
    colorSubtleBackgroundHover: '#d8d2c2',
    colorSubtleBackgroundSelected: '#cec9b9',
    colorNeutralBackground1: '#eee8d5',
    colorNeutralBackground2: '#f2ebd9',
    colorNeutralBackground3: '#fdf6e3',
    colorNeutralBackground1Hover: '#d8d2c2',
    colorNeutralBackground1Pressed: '#fdf6e3',
    colorNeutralBackground1Selected: '#cec9b9',
    colorNeutralBackground3Hover: '#eee8d5',
    colorNeutralBackground3Pressed: '#d8d2c2',
    colorNeutralBackground3Selected: '#cec9b9',
    colorNeutralBackground6: '#d8d2c2',
    colorNeutralBackgroundDisabled: '#fdf6e3',
    colorNeutralStencil1: '#cec9b9',
    colorNeutralStroke1: '#cebfab',
    colorNeutralStroke3: '#cec9b9',
    colorNeutralBackgroundAlpha: 'rgb(253 235 209 / 0.5)',
};

export function getFluentTheme(darkMode: boolean | undefined) {
    return darkMode ? darkTheme : lightTheme;
}
