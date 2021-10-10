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
    Circle = 'circle',
    Cone = 'cone',
    Donut = 'donut',
    Enemy = 'enemy',
    Exaflare = 'exaflare',
    Eye = 'eye',
    Knockback = 'knockback',
    LineKnockAway = 'lineKnockAway',
    LineKnockback = 'lineKnockback',
    LineStack = 'lineStack',
    Marker = 'marker',
    Party = 'party',
    Proximity = 'proximity',
    Rect = 'rect',
    RightTriangle = 'rightTriangle',
    RotateCCW = 'rotateCCW',
    RotateCW = 'rotateCW',
    Stack = 'stack',
    Starburst = 'starburst',
    Tether = 'tether',
    TetherClose = 'tetherClose',
    TetherFar = 'tetherFar',
    TetherMinusMinus = 'tetherMinusMinus',
    TetherPlusMinus = 'tetherPlusMinus',
    TetherTetherPlusPlus = 'tetherPlusPlus',
    Text = 'text',
    Tower = 'tower',
    Triangle = 'triangle',
}

export interface SceneId {
    readonly id: number;
}

export interface UnknownObject extends SceneId {
    readonly type: ObjectType;
}

function makeObjectTest<T extends UnknownObject>(
    ...types: readonly ObjectType[]
): (object: UnknownObject) => object is T {
    return (object): object is T => types.includes(object.type);
}

export interface NoGrid {
    readonly type: GridType.None;
}

export interface RectangularGrid {
    readonly type: GridType.Rectangular;
    readonly rows: number;
    readonly columns: number;
}

export interface RadialGrid {
    readonly type: GridType.Radial;
    readonly angularDivs: number;
    readonly radialDivs: number;
    readonly startAngle?: number;
}

export interface CustomGrid {
    readonly type: GridType.Custom;
    readonly rows: number[];
    readonly columns: number[];
}

export type Grid = NoGrid | RectangularGrid | RadialGrid | CustomGrid;

export interface Arena {
    readonly shape: ArenaShape;
    readonly width: number;
    readonly height: number;
    readonly grid: Grid;
    readonly backgroundImage?: string;
}

export interface ArenaPreset extends Arena {
    name: string;
}

export interface MoveableObject {
    readonly x: number;
    readonly y: number;
    readonly pinned?: boolean;
}

export interface ResizeableObject extends MoveableObject {
    readonly width: number;
    readonly height: number;
    readonly rotation: number;
}

export interface ImageObject extends ResizeableObject {
    readonly image: string;
}

export interface MarkerObject extends ImageObject, SceneId {
    readonly type: ObjectType.Marker;
    readonly shape: 'circle' | 'square';
    readonly name: string;
    readonly color: string;
}
export const isMarker = makeObjectTest<MarkerObject>(ObjectType.Marker);

export interface ArrowObject extends ResizeableObject, SceneId {
    readonly type: ObjectType.Arrow;
    readonly color: string;
    readonly opacity: number;
}
export const isArrow = makeObjectTest<ArrowObject>(ObjectType.Arrow);

export interface TextObject extends MoveableObject, SceneId {
    readonly type: ObjectType.Text;
    readonly text: string;
    readonly fontSize: number;
    readonly align: string;
    readonly color: string;
    readonly opacity: number;
    readonly rotation: number;
}
export const isText = makeObjectTest<TextObject>(ObjectType.Text);

export type Marker = MarkerObject | ArrowObject | TextObject;

export interface ActorStatus {
    readonly icon: string;
    readonly name: string;
}

export interface PartyObject extends ImageObject, SceneId {
    readonly type: ObjectType.Party;
    readonly name: string;
    readonly status: ActorStatus[];
}
export const isParty = makeObjectTest<PartyObject>(ObjectType.Party);

export interface EnemyObject extends MoveableObject, SceneId {
    readonly type: ObjectType.Enemy;
    readonly icon: string;
    readonly name: string;
    readonly color: string;
    readonly radius: number;
    readonly status: ActorStatus[];
    readonly rotation?: number;
}
export const isEnemy = makeObjectTest<EnemyObject>(ObjectType.Enemy);

export type Actor = PartyObject | EnemyObject;
export function isActor(object: UnknownObject): object is Actor {
    return isParty(object) || isEnemy(object);
}

export interface CircleZone extends MoveableObject, SceneId {
    readonly type:
        | ObjectType.Circle
        | ObjectType.Stack
        | ObjectType.Proximity
        | ObjectType.Knockback
        | ObjectType.RotateCW
        | ObjectType.RotateCCW
        | ObjectType.Eye;

    readonly color: string;
    readonly opacity: number;
    readonly hollow?: boolean;
    readonly radius: number;
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

export interface DonutZone extends MoveableObject, SceneId {
    readonly type: ObjectType.Donut;
    readonly color: string;
    readonly opacity: number;
    readonly radius: number;
    readonly innerRadius: number;
}
export const isDonutZone = makeObjectTest<DonutZone>(ObjectType.Donut);

export interface ConeZone extends MoveableObject, SceneId {
    readonly type: ObjectType.Cone;
    readonly color: string;
    readonly opacity: number;
    readonly hollow?: boolean;
    readonly radius: number;
    readonly rotation: number;
    readonly coneAngle: number;
}
export const isConeZone = makeObjectTest<ConeZone>(ObjectType.Cone);

export interface RectangleZone extends ResizeableObject, SceneId {
    readonly type:
        | ObjectType.Rect
        | ObjectType.LineStack
        | ObjectType.LineKnockback
        | ObjectType.LineKnockAway
        | ObjectType.Triangle
        | ObjectType.RightTriangle;
    readonly color: string;
    readonly opacity: number;
    readonly hollow?: boolean;
}
export const isRectangleZone = makeObjectTest<RectangleZone>(
    ObjectType.Rect,
    ObjectType.LineStack,
    ObjectType.LineKnockback,
    ObjectType.LineKnockAway,
    ObjectType.Triangle,
    ObjectType.RightTriangle,
);

export interface ExaflareZone extends MoveableObject, SceneId {
    readonly type: ObjectType.Exaflare;
    readonly color: string;
    readonly opacity: number;
    readonly radius: number;
    readonly length: number;
    readonly rotation: number;
}
export const isExaflareZone = makeObjectTest<ExaflareZone>(ObjectType.Exaflare);

export interface StarburstZone extends MoveableObject, SceneId {
    readonly type: ObjectType.Starburst;
    readonly color: string;
    readonly opacity: number;
    readonly radius: number;
    readonly rotation: number;
    readonly spokes: number;
    readonly spokeWidth: number;
}
export const isStarburstZone = makeObjectTest<StarburstZone>(ObjectType.Starburst);

export interface TowerZone extends MoveableObject, SceneId {
    readonly type: ObjectType.Tower;
    readonly color: string;
    readonly opacity: number;
    readonly radius: number;
    readonly count: number;
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

export interface Tether extends SceneId {
    readonly type:
        | ObjectType.Tether
        | ObjectType.TetherClose
        | ObjectType.TetherFar
        | ObjectType.TetherPlusMinus
        | ObjectType.TetherTetherPlusPlus
        | ObjectType.TetherMinusMinus;
    readonly startId: number;
    readonly endId: number;
}
export const isTether = makeObjectTest<Tether>(
    ObjectType.Tether,
    ObjectType.TetherClose,
    ObjectType.TetherFar,
    ObjectType.TetherPlusMinus,
    ObjectType.TetherTetherPlusPlus,
    ObjectType.TetherMinusMinus,
);

export function isMoveable<T>(object: T): object is MoveableObject & T {
    const moveable = object as MoveableObject & T;
    return moveable && typeof moveable.x === 'number' && typeof moveable.y === 'number';
}

export type SceneObject = UnknownObject | Zone | Marker | Actor | Tether;

export type SceneObjectWithoutId = Omit<SceneObject, 'id'>;

export interface Scene {
    readonly nextId: number;
    readonly arena: Arena;
    readonly objects: readonly SceneObject[];
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
    nextId: 1,
    arena: DEFAULT_ARENA,
    objects: [],
};
