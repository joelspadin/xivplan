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

const BACKGROUND = '#40352c';
const FOREGROUND = '#ffffff';
const GRID = '#6F5A48';
const ENEMY = '#ff0000';

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
            ringColor: ENEMY,
            ringShadowOpacity: 0.5,
            text: {
                fill: FOREGROUND,
                stroke: BACKGROUND,
            },
        },
    };
}
