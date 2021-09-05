import { useTheme } from '@fluentui/react';

export interface ArenaTheme {
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface GridTheme {
    stroke: string;
    strokeWidth: number;
}

export interface SceneTheme {
    arena: ArenaTheme;
    grid: GridTheme;
}

export function useSceneTheme(): SceneTheme {
    const theme = useTheme();

    return {
        arena: {
            fill: theme.palette.white,
            stroke: theme.palette.themeTertiary,
            strokeWidth: 1,
        },
        grid: {
            stroke: theme.palette.themeLight,
            strokeWidth: 1,
        },
    };
}
