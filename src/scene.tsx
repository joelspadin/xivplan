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

export enum ObjectType {
    Arrow = 'arrow',
    Enemy = 'enemy',
    Marker = 'marker',
    Party = 'party',
    Circle = 'circle',
    Stack = 'stack',
    Proximity = 'proximity',
    Knockback = 'knockback',
    RotateCW = 'rotateCW',
    RotateCCW = 'rotateCCW',
    Eye = 'eye',
    Donut = 'donut',
    Cone = 'cone',
    Rect = 'rect',
    LineStack = 'lineStack',
    LineKnockback = 'lineKnockback',
    LineKnockAway = 'lineKnockAway',
    Exaflare = 'exaflare',
    Starburst = 'starburst',
    Tower = 'tower',
    Tether = 'tether',
    TetherClose = 'tetherClose',
    TetherFar = 'tetherFar',
    TetherPlusMinus = 'tetherPlusMinus',
    TetherTetherPlusPlus = 'tetherPlusPlus',
    TetherMinusMinus = 'tetherMinusMinus',
}

export interface UnknownObject {
    type: ObjectType;
}

function makeObjectTest<T extends UnknownObject>(...types: ObjectType[]): (object: UnknownObject) => object is T {
    return (object): object is T => types.includes(object.type);
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
    rotation: number;
}

export interface ImageObject extends ResizeableObject {
    image: string;
}

export interface MarkerObject extends ImageObject {
    type: ObjectType.Marker;
    shape: 'circle' | 'square';
    name: string;
    color: string;
}
export const isMarker = makeObjectTest<MarkerObject>(ObjectType.Marker);

export interface ArrowObject extends ResizeableObject {
    type: ObjectType.Arrow;
    color: string;
}
export const isArrow = makeObjectTest<ArrowObject>(ObjectType.Arrow);

export type Marker = MarkerObject | ArrowObject;

export interface ActorStatus {
    icon: string;
    name: string;
}

export interface PartyObject extends ImageObject {
    type: ObjectType.Party;
    name: string;
    status: ActorStatus[];
}
export const isParty = makeObjectTest<PartyObject>(ObjectType.Party);

export interface EnemyObject extends Point {
    type: ObjectType.Enemy;
    icon: string;
    name: string;
    color: string;
    radius: number;
    status: ActorStatus[];
    rotation?: number;
}
export const isEnemy = makeObjectTest<EnemyObject>(ObjectType.Enemy);

export type Actor = PartyObject | EnemyObject;
export function isActor(object: UnknownObject): object is Actor {
    return isParty(object) || isEnemy(object);
}

export interface CircleZone extends Point {
    type:
        | ObjectType.Circle
        | ObjectType.Stack
        | ObjectType.Proximity
        | ObjectType.Knockback
        | ObjectType.RotateCW
        | ObjectType.RotateCCW
        | ObjectType.Eye;

    color: string;
    opacity: number;
    radius: number;
}
export const isCircleZone = makeObjectTest<CircleZone>(
    ObjectType.Circle,
    ObjectType.Stack,
    ObjectType.Proximity,
    ObjectType.Knockback,
    ObjectType.RotateCW,
    ObjectType.RotateCCW,
    ObjectType.Eye,
);

export interface DonutZone extends Point {
    type: ObjectType.Donut;
    color: string;
    opacity: number;
    radius: number;
    innerRadius: number;
}
export const isDonutZone = makeObjectTest<DonutZone>(ObjectType.Donut);

export interface ConeZone extends Point {
    type: ObjectType.Cone;
    color: string;
    opacity: number;
    radius: number;
    rotation: number;
    coneAngle: number;
}
export const isConeZone = makeObjectTest<ConeZone>(ObjectType.Cone);

export interface RectangleZone extends ResizeableObject {
    type: ObjectType.Rect | ObjectType.LineStack | ObjectType.LineKnockback | ObjectType.LineKnockAway;
    color: string;
    opacity: number;
}
export const isRectangleZone = makeObjectTest<RectangleZone>(
    ObjectType.Rect,
    ObjectType.LineStack,
    ObjectType.LineKnockback,
    ObjectType.LineKnockAway,
);

export interface ExaflareZone extends Point {
    type: ObjectType.Exaflare;
    color: string;
    opacity: number;
    radius: number;
    length: number;
    rotation: number;
}
export const isExaflareZone = makeObjectTest<ExaflareZone>(ObjectType.Exaflare);

export interface StarburstZone extends Point {
    type: ObjectType.Starburst;
    color: string;
    opacity: number;
    radius: number;
    rotation: number;
    spokes: number;
    spokeWidth: number;
}
export const isStarburstZone = makeObjectTest<StarburstZone>(ObjectType.Starburst);

export interface TowerZone extends Point {
    type: ObjectType.Tower;
    color: string;
    opacity: number;
    radius: number;
    count: number;
}
export const isTowerZone = makeObjectTest<TowerZone>(ObjectType.Tower);

export type Zone = CircleZone | DonutZone | ConeZone | RectangleZone | ExaflareZone | StarburstZone | TowerZone;
export function isZone(object: UnknownObject): object is Zone {
    return (
        isCircleZone(object) ||
        isDonutZone(object) ||
        isConeZone(object) ||
        isRectangleZone(object) ||
        isExaflareZone(object) ||
        isStarburstZone(object) ||
        isTowerZone(object)
    );
}

export interface Tether {
    type:
        | ObjectType.Tether
        | ObjectType.TetherClose
        | ObjectType.TetherFar
        | ObjectType.TetherPlusMinus
        | ObjectType.TetherTetherPlusPlus
        | ObjectType.TetherMinusMinus;
    start: number;
    end: number;
}
export const isTether = makeObjectTest<Tether>(
    ObjectType.Tether,
    ObjectType.TetherClose,
    ObjectType.TetherFar,
    ObjectType.TetherPlusMinus,
    ObjectType.TetherTetherPlusPlus,
    ObjectType.TetherMinusMinus,
);

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
