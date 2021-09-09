import { useTheme } from '@fluentui/react';
import Konva from 'konva';

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
    ringColor: string;
    ringShadowOpacity: number;
    text: Partial<Konva.TextConfig>;
}

export interface SceneTheme {
    arena: ArenaTheme;
    grid: GridTheme;
    enemy: EnemyTheme;
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
            stroke: theme.palette.themeTertiary,
            strokeWidth: 1,
        },
        enemy: {
            opacity: 0.75,
            ringColor: theme.palette.red,
            ringShadowOpacity: 0.5,
            text: {
                fill: theme.palette.black,
                stroke: theme.palette.white,
            },
        },
    };
}
