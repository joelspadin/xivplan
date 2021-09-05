export enum ArenaShape {
    Rectangle = 'rectangle',
    Circle = 'circle',
}

export enum GridType {
    None = 'none',
    Rectangular = 'rectangle',
    Radial = 'radial',
    Custom = 'custom',
}

export interface NoGrid {
    type: GridType.None;
}

export interface RectangularGrid {
    type: GridType.Rectangular;
    rows: number;
    columns: number;
}

export interface RadialGrid {
    type: GridType.Radial;
    angularDivs: number;
    radialDivs: number;
    startAngle?: number;
}

export interface CustomGrid {
    type: GridType.Custom;
    rows: number[];
    columns: number[];
}

export type Grid = NoGrid | RectangularGrid | RadialGrid | CustomGrid;

export interface Arena {
    shape: ArenaShape;
    width: number;
    height: number;
    grid: Grid;
    backgroundImage?: string;
}

export interface ArenaPreset extends Arena {
    name: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface ResizeableObject extends Point {
    width: number;
    height: number;
    angle: number;
}

export interface ImageObject extends ResizeableObject {
    type: 'img';
    name: string;
    image: string;
}

export interface ArrowObject extends ResizeableObject {
    type: 'arrow';
    color: string;
}

export type Marker = ImageObject | ArrowObject;

export interface ActorStatus {
    icon: string;
    name: string;
}

export interface Actor extends ImageObject {
    name: string;
    statuses: ActorStatus[];
}

export interface CircleZone extends Point {
    type: 'circle' | 'stack' | 'flare' | 'knockback' | 'cw' | 'ccw' | 'eye';
    color: string;
    radius: number;
}

export interface DonutZone extends Point {
    type: 'donut';
    color: number;
    radius: number;
    innerRadius: number;
}

export interface ConeZone extends Point {
    type: 'cone';
    color: number;
    radius: number;
    width: number;
    angle: number;
}

export interface RectangleZone extends ResizeableObject {
    type: 'rect' | 'lineStack' | 'lineKnockback' | 'lineKnockAway';
    color: number;
}

export interface ExaflareZone extends ResizeableObject {
    type: 'exaflare';
    color: number;
    length: number;
}

export interface StarburstZone extends ResizeableObject {
    type: 'starburst';
    color: number;
    spokes: number;
}

export interface TowerZone extends Point {
    type: 'circle' | 'stack' | 'flare' | 'knockback' | 'rotateCW' | 'rotateCCW';
    color: string;
    radius: number;
}

export type Zone = CircleZone | DonutZone | ConeZone | RectangleZone | ExaflareZone | StarburstZone | TowerZone;

export interface Tether {
    type: 'tether' | 'tetherClose' | 'tetherFar' | 'tetherPlusMinus' | 'tetherPlusPlus' | 'tetherMinusMinus';
    start: number;
    end: number;
}

export type SceneObject = Zone | Marker | Actor | Tether;

export interface Scene {
    arena: Arena;
    zones: Zone[];
    markers: Marker[];
    actors: Actor[];
    tethers: Tether[];
}

export const NO_GRID: NoGrid = {
    type: GridType.None,
};

export const DEFAULT_RECT_GRID: RectangularGrid = {
    type: GridType.Rectangular,
    rows: 4,
    columns: 4,
};

export const DEFAULT_RADIAL_GRID: RadialGrid = {
    type: GridType.Radial,
    angularDivs: 8,
    radialDivs: 2,
};

export const DEFAULT_CUSTOM_GRID: CustomGrid = {
    type: GridType.Custom,
    rows: [-150, 0, 150],
    columns: [-150, 0, 150],
};

export const DEFAULT_ARENA: Arena = {
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    grid: DEFAULT_RECT_GRID,
};

export const DEFAULT_SCENE: Scene = {
    arena: DEFAULT_ARENA,
    zones: [],
    markers: [],
    actors: [],
    tethers: [],
};
