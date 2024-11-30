export enum ArenaShape {
    Rectangle = 'rectangle',
    Circle = 'circle',
}

export enum GridType {
    None = 'none',
    Rectangular = 'rectangle',
    Radial = 'radial',
    CustomRectangular = 'custom',
    CustomRadial = 'customRadial',
}

export enum TickType {
    None = 'none',
    Rectangular = 'rectangle',
    Radial = 'radial',
}

export enum ObjectType {
    Arc = 'arc',
    Arrow = 'arrow',
    Circle = 'circle',
    Cone = 'cone',
    Cursor = 'cursor',
    Donut = 'donut',
    Draw = 'draw',
    Enemy = 'enemy',
    Exaflare = 'exaflare',
    Eye = 'eye',
    Icon = 'icon',
    Knockback = 'knockback',
    Line = 'line',
    LineKnockAway = 'lineKnockAway',
    LineKnockback = 'lineKnockback',
    LineStack = 'lineStack',
    Marker = 'marker',
    Party = 'party',
    Polygon = 'polygon',
    Proximity = 'proximity',
    Rect = 'rect',
    RightTriangle = 'rightTriangle',
    RotateCCW = 'rotateCCW',
    RotateCW = 'rotateCW',
    Stack = 'stack',
    Starburst = 'starburst',
    Tether = 'tether',
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

export interface CustomRectangularGrid {
    readonly type: GridType.CustomRectangular;
    readonly rows: number[];
    readonly columns: number[];
}

export interface CustomRadialGrid {
    readonly type: GridType.CustomRadial;
    readonly rings: number[];
    readonly spokes: number[];
}

export type Grid = NoGrid | RectangularGrid | RadialGrid | CustomRectangularGrid | CustomRadialGrid;

export interface NoTicks {
    readonly type: TickType.None;
}

export interface RectangularTicks {
    readonly type: TickType.Rectangular;
    readonly rows: number;
    readonly columns: number;
}

export interface RadialTicks {
    readonly type: TickType.Radial;
    readonly majorStart: number;
    readonly majorCount: number;
    readonly minorStart: number;
    readonly minorCount: number;
}

export type Ticks = NoTicks | RectangularTicks | RadialTicks;

export interface Arena {
    readonly shape: ArenaShape;
    readonly width: number;
    readonly height: number;
    readonly padding: number;
    readonly grid: Grid;
    readonly ticks?: Ticks;
    readonly backgroundImage?: string;
    readonly backgroundOpacity?: number;
}

export interface ArenaPreset extends Arena {
    name: string;
    spoilerFreeName?: string;
    isSpoilerFree?: boolean;
}

export interface NamedObject {
    readonly name: string;
}

export interface ColoredObject {
    readonly color: string;
}

export interface TransparentObject {
    readonly opacity: number;
}

export interface HollowObject {
    readonly hollow?: boolean;
}

export interface MoveableObject {
    readonly x: number;
    readonly y: number;
    readonly pinned?: boolean;
}

export interface RotateableObject {
    readonly rotation: number;
}

export interface ResizeableObject extends MoveableObject, RotateableObject {
    readonly width: number;
    readonly height: number;
}

export interface RadiusObject extends MoveableObject {
    readonly radius: number;
}

export interface InnerRadiusObject extends MoveableObject {
    readonly innerRadius: number;
}

export interface ImageObject extends ResizeableObject {
    readonly image: string;
}

/**
 * Special object for treating the cursor location as a tether target.
 */
export interface FakeCursorObject extends MoveableObject, SceneId {
    readonly type: ObjectType.Cursor;
}

export interface MarkerObject extends NamedObject, ImageObject, ColoredObject, SceneId {
    readonly type: ObjectType.Marker;
    readonly shape: 'circle' | 'square';
}
export const isMarker = makeObjectTest<MarkerObject>(ObjectType.Marker);

export interface ArrowObject extends ResizeableObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Arrow;
    readonly arrowBegin?: boolean;
    readonly arrowEnd?: boolean;
}
export const isArrow = makeObjectTest<ArrowObject>(ObjectType.Arrow);

export interface TextObject extends MoveableObject, RotateableObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Text;
    readonly text: string;
    readonly fontSize: number;
    readonly align: string;
}
export const isText = makeObjectTest<TextObject>(ObjectType.Text);

export type Marker = MarkerObject | ArrowObject | TextObject;

export interface IconObject extends ImageObject, NamedObject, SceneId {
    readonly type: ObjectType.Icon;
    readonly iconId?: number;
    readonly maxStacks?: number;
    readonly time?: number;
}
export const isIcon = makeObjectTest<IconObject>(ObjectType.Icon);

export interface PartyObject extends ImageObject, NamedObject, SceneId {
    readonly type: ObjectType.Party;
}
export const isParty = makeObjectTest<PartyObject>(ObjectType.Party);

export interface EnemyObject
    extends RadiusObject,
        RotateableObject,
        NamedObject,
        ColoredObject,
        TransparentObject,
        SceneId {
    readonly type: ObjectType.Enemy;
    readonly icon: string;
    readonly omniDirection: boolean;
}
export const isEnemy = makeObjectTest<EnemyObject>(ObjectType.Enemy);

export type Actor = PartyObject | EnemyObject;
export function isActor(object: UnknownObject): object is Actor {
    return isParty(object) || isEnemy(object);
}

export interface CircleZone extends RadiusObject, ColoredObject, TransparentObject, HollowObject, SceneId {
    readonly type:
        | ObjectType.Circle
        | ObjectType.Stack
        | ObjectType.Proximity
        | ObjectType.Knockback
        | ObjectType.RotateCW
        | ObjectType.RotateCCW
        | ObjectType.Eye;
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

export interface DonutZone extends RadiusObject, InnerRadiusObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Donut;
}
export const isDonutZone = makeObjectTest<DonutZone>(ObjectType.Donut);

export interface LineProps extends MoveableObject, ColoredObject, TransparentObject, HollowObject, RotateableObject {
    readonly length: number;
    readonly width: number;
}

export interface LineZone extends LineProps, SceneId {
    readonly type: ObjectType.Line;
}
export const isLineZone = makeObjectTest<LineZone>(ObjectType.Line);

export interface ConeProps extends RadiusObject, ColoredObject, TransparentObject, HollowObject, RotateableObject {
    readonly coneAngle: number;
}

export interface ConeZone extends ConeProps, SceneId {
    readonly type: ObjectType.Cone;
}
export const isConeZone = makeObjectTest<ConeZone>(ObjectType.Cone);

export interface ArcZone extends ConeProps, InnerRadiusObject, SceneId {
    readonly type: ObjectType.Arc;
}
export const isArcZone = makeObjectTest<ArcZone>(ObjectType.Arc);

export interface RectangleZone extends ResizeableObject, ColoredObject, TransparentObject, HollowObject, SceneId {
    readonly type:
        | ObjectType.Rect
        | ObjectType.LineStack
        | ObjectType.LineKnockback
        | ObjectType.LineKnockAway
        | ObjectType.Triangle
        | ObjectType.RightTriangle;
}
export const isRectangleZone = makeObjectTest<RectangleZone>(
    ObjectType.Rect,
    ObjectType.LineStack,
    ObjectType.LineKnockback,
    ObjectType.LineKnockAway,
    ObjectType.Triangle,
    ObjectType.RightTriangle,
);

export interface PolygonZone
    extends RadiusObject,
        ColoredObject,
        TransparentObject,
        HollowObject,
        RotateableObject,
        SceneId {
    readonly type: ObjectType.Polygon;
    readonly sides: number;
}
export const isPolygonZone = makeObjectTest<PolygonZone>(ObjectType.Polygon);

export interface ExaflareZone extends RadiusObject, RotateableObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Exaflare;
    readonly length: number;
    readonly spacing: number;
}
export const isExaflareZone = makeObjectTest<ExaflareZone>(ObjectType.Exaflare);

export interface StarburstZone extends RadiusObject, RotateableObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Starburst;
    readonly spokes: number;
    readonly spokeWidth: number;
}
export const isStarburstZone = makeObjectTest<StarburstZone>(ObjectType.Starburst);

export interface TowerZone extends RadiusObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Tower;
    readonly count: number;
}
export const isTowerZone = makeObjectTest<TowerZone>(ObjectType.Tower);

export type Zone =
    | CircleZone
    | DonutZone
    | ConeZone
    | ArcZone
    | LineZone
    | RectangleZone
    | ExaflareZone
    | StarburstZone
    | TowerZone;
export function isZone(object: UnknownObject): object is Zone {
    return (
        isCircleZone(object) ||
        isDonutZone(object) ||
        isConeZone(object) ||
        isArcZone(object) ||
        isLineZone(object) ||
        isRectangleZone(object) ||
        isExaflareZone(object) ||
        isStarburstZone(object) ||
        isTowerZone(object)
    );
}

export enum TetherType {
    Line = 'line',
    Close = 'close',
    Far = 'far',
    MinusMinus = '--',
    PlusMinus = '+-',
    PlusPlus = '++',
}

export interface Tether extends SceneId, ColoredObject, TransparentObject {
    readonly type: ObjectType.Tether;
    readonly tether: TetherType;
    readonly startId: number;
    readonly endId: number;
    readonly width: number;
}
export const isTether = makeObjectTest<Tether>(ObjectType.Tether);

export interface DrawObject extends ResizeableObject, RotateableObject, ColoredObject, TransparentObject, SceneId {
    readonly type: ObjectType.Draw;
    readonly points: readonly number[];
    readonly brushSize: number;
}
export const isDrawObject = makeObjectTest<DrawObject>(ObjectType.Draw);

export function isNamed<T>(object: T): object is NamedObject & T {
    const obj = object as NamedObject & T;
    return obj && typeof obj.name === 'string';
}

export function isColored<T>(object: T): object is ColoredObject & T {
    const obj = object as ColoredObject & T;
    return obj && typeof obj.color === 'string';
}

export function isTransparent<T>(object: T): object is TransparentObject & T {
    const obj = object as TransparentObject & T;
    return obj && typeof obj.opacity === 'number';
}

export function isMoveable<T>(object: T): object is MoveableObject & T {
    const obj = object as MoveableObject & T;
    return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export function isRotateable<T>(object: T): object is RotateableObject & T {
    const obj = object as RotateableObject & T;
    return obj && typeof obj.rotation === 'number';
}

export function isResizable<T>(object: T): object is ResizeableObject & T {
    if (!isMoveable(object) || !isRotateable(object)) {
        return false;
    }

    const obj = object as ResizeableObject & T;
    return obj && typeof obj.width === 'number' && typeof obj.height === 'number';
}

export function isRadiusObject<T>(object: T): object is RadiusObject & T {
    if (!isMoveable(object)) {
        return false;
    }

    const obj = object as RadiusObject & T;
    return obj && typeof obj.radius === 'number';
}

export function isInnerRadiusObject<T>(object: T): object is InnerRadiusObject & T {
    if (!isMoveable(object)) {
        return false;
    }

    const obj = object as InnerRadiusObject & T;
    return obj && typeof obj.innerRadius === 'number';
}

export function isImageObject<T>(object: T): object is ImageObject & T {
    const obj = object as ImageObject & T;
    return obj && typeof obj.image === 'string';
}

export const supportsHollow = makeObjectTest<HollowObject & UnknownObject>(
    ObjectType.Circle,
    ObjectType.RotateCW,
    ObjectType.RotateCCW,
    ObjectType.Cone,
    ObjectType.Line,
    ObjectType.Rect,
    ObjectType.Triangle,
    ObjectType.RightTriangle,
    ObjectType.Polygon,
);

export type SceneObject = UnknownObject | Zone | Marker | Actor | IconObject | Tether;

export type SceneObjectWithoutId = Omit<SceneObject, 'id'> & { id?: number };

export interface SceneStep {
    readonly objects: readonly SceneObject[];
}

export interface Scene {
    readonly nextId: number;
    readonly arena: Arena;
    readonly steps: SceneStep[];
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

export const DEFAULT_CUSTOM_RECT_GRID: CustomRectangularGrid = {
    type: GridType.CustomRectangular,
    rows: [-150, 0, 150],
    columns: [-150, 0, 150],
};

export const DEFAULT_CUSTOM_RADIAL_GRID: CustomRadialGrid = {
    type: GridType.CustomRadial,
    rings: [150, 450],
    spokes: [0, 45, 90, 135, 180, 225, 270, 315],
};

export const NO_TICKS: NoTicks = {
    type: TickType.None,
};

export const DEFAULT_RECT_TICKS: RectangularTicks = {
    type: TickType.Rectangular,
    rows: 20,
    columns: 20,
};

export const DEFAULT_RADIAL_TICKS: RadialTicks = {
    type: TickType.Radial,
    majorStart: 0,
    majorCount: 8,
    minorStart: 0,
    minorCount: 72,
};

export const DEFAULT_ARENA_PADDING = 120;

export const DEFAULT_ARENA: Arena = {
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: 120,
    grid: DEFAULT_RECT_GRID,
};

export const DEFAULT_SCENE: Scene = {
    nextId: 1,
    arena: DEFAULT_ARENA,
    steps: [{ objects: [] }],
};
