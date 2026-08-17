import type { Vector2d } from 'konva/lib/types';
import { decode, ICON_TYPES, type BackgroundType, type DecodeResult, type StrategyObject } from 'xiv-strat-board';
import { rotateCoord } from '../coord';
import { getJob, getJobIconUrl, Job } from '../jobs';
import { getStrokeWidth } from '../prefabs/zone/style';
import {
    PRESET_STGY_CHECKERED,
    PRESET_STGY_CHECKERED_CIRCLE,
    PRESET_STGY_CHECKERED_SQUARE,
    PRESET_STGY_GREY_CIRCLE,
    PRESET_STGY_GREY_SQUARE,
    PRESET_STGY_NONE,
} from '../presets/StrategyBoard';
import {
    EnemyIconStyle,
    EnemyRingStyle,
    ObjectType,
    ProximityStyle,
    type ArcZone,
    type Arena,
    type ArrowObject,
    type CircleZone,
    type ConeZone,
    type DonutZone,
    type EnemyObject,
    type ExaflareZone,
    type EyeObject,
    type IconObject,
    type LineStackZone,
    type LineZone,
    type MarkerObject,
    type MoveableObject,
    type PartyObject,
    type ProximityZone,
    type RectangleZone,
    type Scene,
    type SceneObject,
    type StackZone,
    type TextObject,
    type TowerZone,
} from '../scene';
import {
    COLOR_BLUE,
    COLOR_BLUE_WHITE,
    COLOR_ORANGE,
    COLOR_PINK,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
    DEFAULT_ENEMY_COLOR,
} from '../theme';
import { degtorad, mod360, setOrOmit } from '../util';
import { distance, vecAdd, vecAngle, vecMult, vecSub } from '../vector';

// (technically `[stgy:a` for all known share codes, but the `a` is likely a version marker)
export const SHARE_CODE_PREFIX = '[stgy:';

// in-game strategy boards are 512x384, with (0,0) being in the top-left and all object positions being in their center.
// Size is a % from each object's default size
const STGY_ARENA_WIDTH = PRESET_STGY_NONE.arena.width;
const STGY_ARENA_HEIGHT = PRESET_STGY_NONE.arena.height;

// Common logic will set the id, 'hide' and 'pinned'.
// The opacity is set with a default max of 100, but indvidual interpreter functions can overide this.
type Partial<T extends SceneObject & MoveableObject> = Omit<T, 'id' | 'hide' | 'pinned' | 'opacity'> & {
    opacity?: number;
};

// Types that the installed branch of the stgy parser library hasn't included yet.
// TODO: clean up once xiv-strat-board has BST support
// Exported for testing
export const NEW_ICON_TYPES: Record<number, string> = { 141: 'beastmaster' };

// String keys instead of IconType since StrategyObject.type is an `IconType | string`, so effectively a string.
// Exported for testing
export const STGY_OBJECT_INTERPRETERS: Record<
    string,
    (stgyObj: StrategyObject) => Partial<SceneObject & MoveableObject>
> = {
    // Player roles
    gladiator: interpretPlayerObject(Job.Gladiator),
    pugilist: interpretPlayerObject(Job.Pugilist),
    marauder: interpretPlayerObject(Job.Marauder),
    lancer: interpretPlayerObject(Job.Lancer),
    archer: interpretPlayerObject(Job.Archer),
    conjurer: interpretPlayerObject(Job.Conjurer),
    thaumaturge: interpretPlayerObject(Job.Thaumaturge),
    arcanist: interpretPlayerObject(Job.Arcanist),
    rogue: interpretPlayerObject(Job.Rogue),
    paladin: interpretPlayerObject(Job.Paladin),
    monk: interpretPlayerObject(Job.Monk),
    warrior: interpretPlayerObject(Job.Warrior),
    dragoon: interpretPlayerObject(Job.Dragoon),
    bard: interpretPlayerObject(Job.Bard),
    white_mage: interpretPlayerObject(Job.WhiteMage),
    black_mage: interpretPlayerObject(Job.BlackMage),
    summoner: interpretPlayerObject(Job.Summoner),
    scholar: interpretPlayerObject(Job.Scholar),
    ninja: interpretPlayerObject(Job.Ninja),
    machinist: interpretPlayerObject(Job.Machinist),
    dark_knight: interpretPlayerObject(Job.DarkKnight),
    astrologian: interpretPlayerObject(Job.Astrologian),
    samurai: interpretPlayerObject(Job.Samurai),
    red_mage: interpretPlayerObject(Job.RedMage),
    blue_mage: interpretPlayerObject(Job.BlueMage),
    beastmaster: interpretPlayerObject(Job.Beastmaster),
    gunbreaker: interpretPlayerObject(Job.Gunbreaker),
    dancer: interpretPlayerObject(Job.Dancer),
    reaper: interpretPlayerObject(Job.Reaper),
    sage: interpretPlayerObject(Job.Sage),
    viper: interpretPlayerObject(Job.Viper),
    pictomancer: interpretPlayerObject(Job.Pictomancer),
    tank: interpretPlayerObject(Job.RoleTank),
    tank_1: interpretPlayerObject(Job.RoleTank1),
    tank_2: interpretPlayerObject(Job.RoleTank2),
    healer: interpretPlayerObject(Job.RoleHealer),
    healer_1: interpretPlayerObject(Job.RoleHealer1),
    healer_2: interpretPlayerObject(Job.RoleHealer2),
    dps: interpretPlayerObject(Job.RoleDps),
    // dps 1-4 will just get dps 1-4 rather than melee 1-2 & ranged 1-2.
    // this is a viewer-side setting not part of the board definition, so we can't tell
    // what the intended state was.
    dps_1: interpretPlayerObject(Job.RoleDps1),
    dps_2: interpretPlayerObject(Job.RoleDps2),
    dps_3: interpretPlayerObject(Job.RoleDps3),
    dps_4: interpretPlayerObject(Job.RoleDps4),
    melee_dps: interpretPlayerObject(Job.RoleMelee),
    ranged_dps: interpretPlayerObject(Job.RoleRanged),
    physical_ranged_dps: interpretPlayerObject(Job.RolePhysicalRanged),
    magical_ranged_dps: interpretPlayerObject(Job.RoleMagicRanged),
    pure_healer: interpretPlayerObject(Job.RolePureHealer),
    barrier_healer: interpretPlayerObject(Job.RoleBarrierHealer),

    // Signs
    attack_1: interpretIconObject('Attack 1', '/marker/attack1.png', 32),
    attack_2: interpretIconObject('Attack 2', '/marker/attack2.png', 32),
    attack_3: interpretIconObject('Attack 3', '/marker/attack3.png', 32),
    attack_4: interpretIconObject('Attack 4', '/marker/attack4.png', 32),
    attack_5: interpretIconObject('Attack 5', '/marker/attack5.png', 32),
    attack_6: interpretIconObject('Attack 6', '/marker/attack6.png', 32),
    attack_7: interpretIconObject('Attack 7', '/marker/attack7.png', 32),
    attack_8: interpretIconObject('Attack 8', '/marker/attack8.png', 32),
    bind_1: interpretIconObject('Bind 1', '/marker/bind1.png', 32),
    bind_2: interpretIconObject('Bind 2', '/marker/bind2.png', 32),
    bind_3: interpretIconObject('Bind 3', '/marker/bind3.png', 32),
    ignore_1: interpretIconObject('Ignore 1', '/marker/ignore1.png', 32),
    ignore_2: interpretIconObject('Ignore 2', '/marker/ignore2.png', 32),
    circle_marker: interpretIconObject('Circle', '/marker/circle.png', 32),
    plus_marker: interpretIconObject('Cross', '/marker/cross.png', 32),
    square_marker: interpretIconObject('Square', '/marker/square.png', 32),
    triangle_marker: interpretIconObject('Triangle', '/marker/triangle.png', 32),

    // Target icons
    lockon_blue: interpretIconObject('Blue Lock-on', '/marker/target_blue.png', 50),
    lockon_green: interpretIconObject('Green Lock-on', '/marker/target_green.png', 50),
    lockon_purple: interpretIconObject('Purple Lock-on', '/marker/target_purple.png', 50),
    lockon_red: interpretIconObject('Red Lock-on', '/marker/target_red.png', 50),
    targeting: interpretIconObject('Crosshairs', '/marker/target_crosshairs.png', 60),
    tankbuster: interpretIconObject('Tankbuster', '/marker/tankbuster.png', 60),
    // "playstation markers"
    highlighted_circle: interpretIconObject('Circle', '/marker/shape_circle.png', 38),
    highlighted_square: interpretIconObject('Square', '/marker/shape_square.png', 38),
    highlighted_triangle: interpretIconObject('Triangle', '/marker/shape_triangle.png', 38),
    highlighted_x: interpretIconObject('Cross', '/marker/shape_cross.png', 38),

    // Plain shapes
    shape_circle: interpretIconObject('Circle', '/marker/plain_circle.png', 50),
    shape_square: interpretIconObject('Square', '/marker/plain_square.png', 50),
    shape_triangle: interpretIconObject('Triangle', '/marker/plain_triangle.png', 50),
    shape_x: interpretIconObject('X', '/marker/plain_cross.png', 50),

    // Status effects
    enhancement: interpretIconObject('Enhancement', '/marker/enhancement.png', 32),
    enfeeblement: interpretIconObject('Enfeeblement', '/marker/enfeeblement.png', 32),

    // Waymarks
    waymark_1: interpretWaymarkObject('Waymark 1', '/marker/waymark_1.png', 'square'),
    waymark_2: interpretWaymarkObject('Waymark 2', '/marker/waymark_2.png', 'square'),
    waymark_3: interpretWaymarkObject('Waymark 3', '/marker/waymark_3.png', 'square'),
    waymark_4: interpretWaymarkObject('Waymark 4', '/marker/waymark_4.png', 'square'),
    waymark_a: interpretWaymarkObject('Waymark A', '/marker/waymark_a.png', 'circle'),
    waymark_b: interpretWaymarkObject('Waymark B', '/marker/waymark_b.png', 'circle'),
    waymark_c: interpretWaymarkObject('Waymark C', '/marker/waymark_c.png', 'circle'),
    waymark_d: interpretWaymarkObject('Waymark D', '/marker/waymark_d.png', 'circle'),

    // Towers
    tower: interpretTowerObject(1, COLOR_RED, 60),
    '1person_aoe': interpretTowerObject(1, COLOR_PINK, 53),
    '2person_aoe': interpretTowerObject(2, COLOR_PINK, 53),
    '3person_aoe': interpretTowerObject(3, COLOR_PINK, 53),
    '4person_aoe': interpretTowerObject(4, COLOR_PINK, 53),

    // Mini arenas
    grey_circle: interpretMiniArena('Grey Circle', 'marker/circle_grey.png'),
    grey_square: interpretMiniArena('Grey Square', 'marker/square_grey.png'),
    checkered_circle: interpretMiniArena('Checkered Circle', 'marker/circle_checkered.png'),
    checkered_square: interpretMiniArena('Checkered Square', 'marker/square_checkered.png'),

    // Enemies
    small_enemy: interpretEnemyObject(EnemyIconStyle.Small),
    medium_enemy: interpretEnemyObject(EnemyIconStyle.Medium),
    large_enemy: interpretEnemyObject(EnemyIconStyle.Large),

    // Rotation icons
    rotate_clockwise: interpretRotationIcon(ObjectType.RotateCW),
    rotate_counterclockwise: interpretRotationIcon(ObjectType.RotateCCW),
    rotate: interpretPlainRotationIcon,

    // Various unique types
    gaze: interpretGazeObject,
    text: interpretTextObject,
    line: interpretLineObject,
    up_arrow: interpretArrowIcon,

    // Stacks
    stack: interpretStackObject(false),
    stack_multi: interpretStackObject(true),
    line_stack: interpretLineStack,

    // Knockbacks
    linear_knockback: interpretLineKnockback,
    radial_knockback: interpretRadialKnockback,

    // Proximity markers
    proximity: interpretGroundProximity,
    proximity_player: interpretPlayerProximity,

    // AoEs
    circle_aoe: interpretCircleAoe,
    line_aoe: interpretLineAoe,
    moving_circle_aoe: interpretExaflare,
    fan_aoe: interpretConeObject,
    donut: interpretDonutObject,

    // what is this type? some internal representation for when >1 object is selected?
    // There's an icon in the dump that looks like it could represent a group, but I can find nothing in-game.
    group: () => {
        throw Error("unsupported icon type 'group'; please file a bug describing how you got a board to contain this.");
    },
};

/** Parses the given Strategy Board Share Code into an xivplan Scene. */
export function interpretShareCode(shareCode: string): Scene | undefined {
    let decoded: DecodeResult | undefined;
    try {
        decoded = decode(shareCode);
    } catch (e) {
        console.error(`unable to parse share code. error: ${JSON.stringify(e)}`);
        return undefined;
    }

    const arena = interpretArena(decoded.boardBackground);

    let nextId = 1;
    const objects: SceneObject[] = [];

    // reverse object order for correct layering
    decoded.objects.reverse().forEach((stgyObj) => {
        const obj = interpretObject(stgyObj);
        if (obj !== undefined) {
            let updatedObj: SceneObject & MoveableObject = { ...interpretOpacity(stgyObj), ...obj, id: nextId++ };
            updatedObj = setOrOmit(updatedObj, 'hide', stgyObj.hidden);
            updatedObj = setOrOmit(updatedObj, 'pinned', stgyObj.locked);
            objects.push(updatedObj);
        } else {
            console.log(`unsupported object ignored: ${JSON.stringify(stgyObj)}`);
        }
    });

    // Add the title as a text object above the arena
    if (decoded.name !== undefined && decoded.name.length > 0) {
        objects.push({
            id: nextId++,
            ...createTitleObject(decoded.name, arena),
        });
    }

    return {
        arena,
        nextId,
        steps: [{ objects }],
    };
}

function createTitleObject(name: string, arena: Arena): Omit<TextObject, 'id'> {
    return {
        type: ObjectType.Text,
        x: 0,
        y: arena.height / 2 + 60,
        text: name,
        rotation: 0,
        opacity: 100,
        align: 'center',
        color: COLOR_WHITE,
        fontSize: 25,
        stroke: '#40325c',
        style: 'outline',
    };
}

/** Interprets the given StrategyObject as a SceneObject (with an arbitrary id), or undefined if there is no reasonable approximation. */
function interpretObject(stgyObj: StrategyObject): Partial<SceneObject & MoveableObject> | undefined {
    let typeString: string | undefined = stgyObj.type;
    if (stgyObj.typeId !== undefined) {
        typeString = ICON_TYPES[stgyObj.typeId] ?? NEW_ICON_TYPES[stgyObj.typeId];
    }
    if (typeString === undefined) {
        // Since the type id should always be present when decoding, this most likely means the game added new object types
        // but neither xiv-strat-board nor NEW_ICON_TYPES has configured support for it yet.
        console.warn(`object type id is present (${stgyObj.typeId}), but currently unsupported.`);
        return undefined;
    }

    const interpreter = STGY_OBJECT_INTERPRETERS[typeString];
    if (interpreter !== undefined) {
        try {
            return interpreter(stgyObj);
        } catch (e) {
            console.error(`failed to interpret object. error: ${JSON.stringify(e)}`);
            return undefined;
        }
    } else {
        // This should have caused a failing test
        console.error(`object type ${typeString} (id ${stgyObj.typeId}) has no interpreter`);
        return undefined;
    }
}

/** Calculate the scaling factor to apply based on the configured size. Returns 1 for a size of 100. */
function getScale(stgyObj: StrategyObject): number {
    return (stgyObj.size ?? 100) / 100;
}

/** Transforms the object's transparency into opacity. 0 transparency results in `maxOpacity` opacity. */
function interpretOpacity(stgyObj: StrategyObject, maxOpacity = 100): { opacity: number } {
    const opacityFraction = (100 - (stgyObj.transparency ?? 0)) / 100;
    return { opacity: Math.round(opacityFraction * maxOpacity) };
}

/** Transforms coordinates in stgy space to xivplan space. */
function interpretPosition(stgyObj: StrategyObject | Vector2d): Vector2d {
    return {
        x: stgyObj.x - STGY_ARENA_WIDTH / 2,
        y: -stgyObj.y + STGY_ARENA_HEIGHT / 2,
    };
}

function interpretPlayerObject(job: Job): (stgyObj: StrategyObject) => Partial<PartyObject> {
    return (stgyObj: StrategyObject) => {
        const scale = getScale(stgyObj);
        const jobProps = getJob(job);
        return {
            type: ObjectType.Party,
            width: 30 * scale,
            height: 30 * scale,
            ...interpretPosition(stgyObj),
            rotation: stgyObj.angle ?? 0,
            image: getJobIconUrl(jobProps.icon),
            name: jobProps.name,
        };
    };
}

function interpretIconObject(
    name: string,
    image: string,
    baseSize: number,
): (stgyObj: StrategyObject) => Partial<IconObject> {
    return (stgyObj: StrategyObject) => {
        const scale = getScale(stgyObj);

        return {
            type: ObjectType.Icon,
            ...interpretPosition(stgyObj),
            width: scale * baseSize,
            height: scale * baseSize,
            rotation: stgyObj.angle ?? 0,
            name,
            image,
        };
    };
}

function interpretWaymarkObject(
    name: string,
    image: string,
    shape: 'circle' | 'square',
): (stgyObj: StrategyObject) => Partial<MarkerObject> {
    return (stgyObj: StrategyObject) => {
        const scale = getScale(stgyObj);

        return {
            type: ObjectType.Marker,
            ...interpretPosition(stgyObj),
            // try to match the symbol size.
            width: scale * 60,
            height: scale * 60,
            rotation: stgyObj.angle ?? 0,
            name,
            image,
            // Strategy boards don't have waymark outlines
            color: 'transparent',
            shape,
        };
    };
}

function interpretTowerObject(
    playerCount: number,
    color: string,
    baseSize: number,
): (stgyObj: StrategyObject) => Partial<TowerZone> {
    return (stgyObj: StrategyObject) => {
        // rotation is not supported in our tower object
        return {
            type: ObjectType.Tower,
            color,
            count: playerCount,
            ...interpretPosition(stgyObj),
            radius: (baseSize * getScale(stgyObj)) / 2,
            ...interpretOpacity(stgyObj, 50),
        };
    };
}

function interpretMiniArena(name: string, image: string): (stgyObj: StrategyObject) => Partial<MarkerObject> {
    // Since this is a floor image, put it on the ground layer by way of the marker object
    // so that it doesn't make other ground-layer objects (like enemies) unclickable even if it's
    // supposed to be behind them.
    // TODO: figure out something less hacky, and remove the color/shape controls this adds?
    // (allow images as rectangle zone bgs maybe?)
    const iconRatio = 32 / 42; // Markers.tsx#ICON_RATIO, not worth extracting into a shared constant just for this hack
    return (stgyObj: StrategyObject) => {
        const scale = getScale(stgyObj);
        return {
            name,
            type: ObjectType.Marker,
            height: (scale * 256) / iconRatio,
            width: (scale * 256) / iconRatio,
            ...interpretPosition(stgyObj),
            rotation: stgyObj.angle ?? 0,
            image,
            shape: 'square',
            color: 'transparent',
        };
    };
}

function interpretEnemyObject(icon: EnemyIconStyle): (stgyObj: StrategyObject) => Partial<EnemyObject> {
    return (stgyObj: StrategyObject) => {
        let rotation = stgyObj.angle ?? 0;
        if (stgyObj.verticalFlip) {
            rotation = mod360(rotation + 180);
        }
        return {
            type: ObjectType.Enemy,
            name: '',
            color: DEFAULT_ENEMY_COLOR,
            ...interpretPosition(stgyObj),
            icon,
            ring: EnemyRingStyle.NoRing,
            rotateIcon: true,
            radius: getScale(stgyObj) * 63,
            rotation,
        };
    };
}

function interpretRotationIcon(
    type: typeof ObjectType.RotateCW | typeof ObjectType.RotateCCW,
): (stgyObj: StrategyObject) => Partial<CircleZone> {
    return (stgyObj: StrategyObject) => {
        // approximate the icon using the rotate object
        return {
            type,
            color: type == ObjectType.RotateCW ? COLOR_ORANGE : COLOR_BLUE,
            ...interpretPosition(stgyObj),
            radius: 18 * getScale(stgyObj),
            hollow: true,
        };
    };
}

function interpretPlainRotationIcon(stgyObj: StrategyObject): Partial<IconObject> {
    let rotation = stgyObj.angle ?? 0;
    let image = 'marker/plain_rotate_ccw.png';
    if (stgyObj.verticalFlip) {
        rotation = mod360(rotation + 180);
        if (!stgyObj.horizontalFlip) {
            image = 'marker/plain_rotate_cw.png';
        }
    } else if (stgyObj.horizontalFlip) {
        image = 'marker/plain_rotate_cw.png';
    }
    const scale = getScale(stgyObj);
    return {
        name: 'Rotate',
        type: ObjectType.Icon,
        height: scale * 50,
        width: scale * 50,
        ...interpretPosition(stgyObj),
        rotation,
        image,
    };
}

function interpretGazeObject(stgyObj: StrategyObject): Partial<EyeObject> {
    return {
        type: ObjectType.Eye,
        ...interpretPosition(stgyObj),
        color: COLOR_RED,
        radius: 32 * getScale(stgyObj),
        rotation: stgyObj.angle ?? 0,
    };
}

function interpretTextObject(stgyObj: StrategyObject): Partial<TextObject> {
    // stgy does not support rotating or resizing text
    return {
        type: ObjectType.Text,
        ...interpretPosition(stgyObj),
        rotation: 0,
        opacity: 100,
        color: stgyObj.color ?? COLOR_WHITE,
        align: 'center',
        fontSize: 16,
        text: stgyObj.text ?? ' ',
        stroke: '#40325c',
        style: 'outline',
    };
}

function interpretLineObject(stgyObj: StrategyObject): Partial<LineZone> {
    // Arguably the stgy 'line' is a tether, but adding placeholder objects for the
    // endpoints is probably confusing, when non-meme plans likely have them visually
    // connect two other objects in the scene.
    // Both endpoint positions and the angle are given. We use the diff vector anyway
    // for the length, so also use that to get the angle instead to guarantee consistency
    // with the given points.
    // (this also allows all returned objects to be a MoveableObject for some shared
    // interpretation logic)
    const start = interpretPosition(stgyObj);
    const end = interpretPosition({ x: stgyObj.endX!, y: stgyObj.endY! });
    const diff = vecSub(end, start);
    const rotation = vecAngle(diff);
    return {
        type: ObjectType.Line,
        ...start,
        rotation,
        width: stgyObj.height ?? 5,
        length: distance(diff),
        color: stgyObj.color ?? COLOR_ORANGE,
    };
}

function interpretArrowIcon(stgyObj: StrategyObject): Partial<ArrowObject> {
    const scale = getScale(stgyObj);
    // approximate the icon using an arrow.
    const center = interpretPosition(stgyObj);
    const rotation = (stgyObj.angle ?? 0) + (stgyObj.verticalFlip ? 180 : 0);
    const start = rotateCoord({ x: center.x, y: center.y - scale * 20 }, rotation, center);
    return {
        type: ObjectType.Arrow,
        ...start,
        color: '#faf6d4',
        length: scale * 35,
        width: scale * 35,
        rotation,
        arrowEnd: true,
    };
}

function interpretStackObject(multiHit: boolean): (stgyObj: StrategyObject) => Partial<StackZone> {
    return (stgyObj: StrategyObject) => {
        // stgy objects may have a rotation here, but we don't support rotating them.
        const baseStack: Partial<StackZone> = {
            type: ObjectType.Stack,
            color: stgyObj.color ?? COLOR_ORANGE,
            count: 1,
            ...interpretPosition(stgyObj),
            radius: 50 * getScale(stgyObj),
        };
        return setOrOmit(baseStack, 'multiHit', multiHit);
    };
}

function interpretLineStack(stgyObj: StrategyObject): Partial<LineStackZone> {
    const center = interpretPosition(stgyObj);
    const scale = getScale(stgyObj);
    const width = scale * 110;
    let length = scale * 110;
    // the padding is trimmed for the 1-display case to better match what's displayed,
    // but needs to be included when it's repeated
    if (stgyObj.displayCount ?? 1 > 0) {
        length = length * (stgyObj.displayCount ?? 1) + ((stgyObj.displayCount ?? 1) - 1) * 20 * scale;
    }
    // there's a possible vertical flip, but we don't support flipping the center arrow.
    // do still rotate it to simulate the flip since the zone itself is directional, even if
    // it won't have any visible diff in screenshots.
    const rotation = mod360((stgyObj.angle ?? 0) + (stgyObj.verticalFlip ? 180 : 0));
    const relativeOrigin = rotateCoord({ x: 0, y: -length / 2 }, rotation);
    return {
        type: ObjectType.LineStack,
        color: stgyObj.color ?? COLOR_ORANGE,
        width,
        length,
        x: center.x + relativeOrigin.x,
        y: center.y + relativeOrigin.y,
        rotation,
        ...interpretOpacity(stgyObj, 50),
        hollow: true,
    };
}

function interpretLineKnockback(stgyObj: StrategyObject): Partial<RectangleZone> {
    const scale = getScale(stgyObj);
    const rotation = mod360((stgyObj.angle ?? 0) + (stgyObj.verticalFlip ? 0 : 180));
    let width = scale * 200;
    let height = scale * 200;
    // the padding is trimmed for the 1-count case to better match what's displayed,
    // but needs to be included when it's repeated
    if (stgyObj.verticalCount ?? 1 > 0) {
        height = height * (stgyObj.verticalCount ?? 1) + ((stgyObj.verticalCount ?? 1) - 1) * 60 * scale;
    }
    if (stgyObj.horizontalCount ?? 1 > 0) {
        width = width * (stgyObj.horizontalCount ?? 1) + ((stgyObj.horizontalCount ?? 1) - 1) * 60 * scale;
    }
    return {
        type: ObjectType.LineKnockback,
        ...interpretPosition(stgyObj),
        width,
        height,
        color: COLOR_ORANGE,
        rotation,
        hollow: true,
        ...interpretOpacity(stgyObj, 80),
    };
}

function interpretRadialKnockback(stgyObj: StrategyObject): Partial<CircleZone> {
    // We don't support rotating the knockback zone's arrows, so the angle is ignored.
    return {
        type: ObjectType.Knockback,
        ...interpretPosition(stgyObj),
        radius: 120 * getScale(stgyObj),
        color: COLOR_ORANGE,
        ...interpretOpacity(stgyObj, 50),
    };
}

function interpretGroundProximity(stgyObj: StrategyObject): Partial<ProximityZone> {
    return {
        type: ObjectType.Proximity,
        color: COLOR_YELLOW,
        ...interpretPosition(stgyObj),
        ...interpretOpacity(stgyObj, 50),
        // stgy has the arcs on the intercardinals at 0 deg
        rotation: mod360((stgyObj.angle ?? 0) + 45),
        proximityStyle: ProximityStyle.Ground,
        // match the radius of the zone, but approximate the proportion to
        // something that can also be manually configured.
        // (this is a "happy" medium between too-large for the solid circle and too-small for the arcs)
        iconProportion: 30,
        radius: getScale(stgyObj) * 122,
    };
}

function interpretPlayerProximity(stgyObj: StrategyObject): Partial<ProximityZone> {
    const scale = getScale(stgyObj);
    // The bounding box is not symmetric around the visual center of the icon, so the
    // position is not its center either.
    const relativeCenter = rotateCoord({ x: 0, y: 8 * scale }, stgyObj.angle ?? 0);
    const imageCenter = interpretPosition(stgyObj);
    return {
        type: ObjectType.Proximity,
        color: COLOR_BLUE_WHITE,
        ...vecAdd(imageCenter, relativeCenter),
        ...interpretOpacity(stgyObj, 60),
        // stgy has an arrow pointing down at 0 deg
        rotation: mod360((stgyObj.angle ?? 0) + 180),
        hideGradient: true,
        // For more-convenient manual control after importing, max out the icon size.
        iconProportion: 50,
        radius: scale * 64,
    };
}

function interpretCircleAoe(stgyObj: StrategyObject): Partial<CircleZone> {
    return {
        type: ObjectType.Circle,
        ...interpretPosition(stgyObj),
        color: stgyObj.color ?? COLOR_ORANGE,
        radius: getScale(stgyObj) * 245,
        ...interpretOpacity(stgyObj, 60),
    };
}

function interpretLineAoe(stgyObj: StrategyObject): Partial<RectangleZone> {
    const strokeWidth = getStrokeWidth(Math.max(stgyObj.width ?? 20, stgyObj.height ?? 20));
    return {
        type: ObjectType.Rect,
        ...interpretPosition(stgyObj),
        color: stgyObj.color ?? COLOR_ORANGE,
        width: (stgyObj.width ?? 20) - strokeWidth,
        height: (stgyObj.height ?? 20) - strokeWidth,
        rotation: stgyObj.angle ?? 0,
    };
}

function interpretExaflare(stgyObj: StrategyObject): Partial<ExaflareZone> {
    const radius = getScale(stgyObj) * 62;
    return {
        type: ObjectType.Exaflare,
        color: stgyObj.color ?? COLOR_ORANGE,
        ...interpretPosition(stgyObj),
        length: 1,
        rotation: mod360((stgyObj.angle ?? 0) + 180),
        ...interpretOpacity(stgyObj, 35),
        spacing: radius,
        radius,
    };
}

const GROWING_CONE_BOX_SIZE: Record<number, number> = {
    [0]: 260,
    [5]: 35,
    [10]: 66,
    [15]: 95,
    [20]: 120,
    [25]: 142,
    [30]: 161,
    [35]: 174,
    [40]: 182,
    [45]: 185,
    [50]: 200,
    [55]: 214,
    [60]: 226,
    [65]: 236,
    [70]: 245,
    [75]: 251,
    [80]: 256,
    [85]: 259,
};

/**
 * The bounding box is a lot tighter for 5-90 for donut objects, but then gets the
 * weirdly large bounding boxes matching the cone shape for >90.
 */
const GROWING_DONUT_BOX_SIZE_FOR_SMALL_ANGLES: Record<number, number> = {
    [0]: 260,
    [5]: 26,
    [10]: 48,
    [15]: 70,
    [20]: 91,
    [25]: 112,
    [30]: 132,
    [35]: 150,
    [40]: 169,
    [45]: 185,
    [50]: 199,
    [55]: 212,
    [60]: 224,
    [65]: 236,
    [70]: 244,
    [75]: 250,
    [80]: 256,
    [85]: 258,
};

/** The padding on any side where the cone isn't growing into yet */
const STRAIGHT_EDGE_BOX_SIZE = 5;

const DEFAULT_CONE_RADIUS = 248;
const MAX_DONUT_OUTER_RADIUS = 256;
const MAX_DONUT_INNER_RADIUS = 240;

/**
 * For some reason the displayed arcs of fan AoEs are off by several degrees except for multiples of 45.
 * The "real" arcs probably have some fractional component, but we're not going to get 100%
 * accurate with how fan AoEs work in the strategy board anyway; this seems close enough in testing.
 */
const ACTUAL_CONE_ARC_ANGLES: Record<number, number> = {
    [0]: 0,
    [5]: 6,
    [10]: 11,
    [15]: 18,
    [20]: 23,
    [25]: 28,
    [30]: 33,
    [35]: 36,
    [40]: 41,
    [45]: 45,
    [50]: 49,
    [55]: 52,
    [60]: 56,
    [65]: 61,
    [70]: 66,
    [75]: 72,
    [80]: 77,
    [85]: 83,
};

interface CommonConeProps {
    x: number;
    y: number;
    rotation: number;
    coneAngle: number;
    radius: number;
}

/**
 * Calculate the Cone properties required to approximate how a given "Fan AoE" object would be rendered.
 * @param fixAngle transformation to apply to the configured angle to get the angle of the displayed object
 * @param growingSideSize how far from the object origin the bounding box is in the direction the cone is "growing" into. (% 90 => the side that angle is pointing to)
 */
function interpretConeProperties(
    stgyObj: StrategyObject,
    fixAngle: (a: number) => number,
    growingSideSize: (a: number) => number,
): CommonConeProps {
    const boxCenter = interpretPosition(stgyObj);
    // Since we have lookup tables, unexpected angles won't work
    if (stgyObj.arcAngle === undefined) {
        throw new Error('cone/donut without arc angle');
    }
    if (stgyObj.arcAngle % 5 != 0) {
        throw new Error('cone/donut with too-specific angle');
    }
    const arcAngle = fixAngle(stgyObj.arcAngle);

    let radius = DEFAULT_CONE_RADIUS;
    // As the inner radius grows, the outer radius also grows a little
    if (stgyObj.donutRadius ?? 0 > 0) {
        radius +=
            (MAX_DONUT_OUTER_RADIUS - DEFAULT_CONE_RADIUS) * ((stgyObj.donutRadius ?? 0) / MAX_DONUT_INNER_RADIUS);
    }

    const boxEdgesFromOrigin = {
        left: STRAIGHT_EDGE_BOX_SIZE,
        right: STRAIGHT_EDGE_BOX_SIZE,
        top: growingSideSize(0),
        bottom: STRAIGHT_EDGE_BOX_SIZE,
    };
    const coneArea = {
        left: 0,
        right: 0,
        top: radius,
        bottom: 0,
    };

    const addedSizeByConeAngle = arcAngle % 90 == 0 ? radius : Math.sin(degtorad(arcAngle % 90)) * radius;
    if (stgyObj.arcAngle <= 90) {
        boxEdgesFromOrigin.right = growingSideSize(stgyObj.arcAngle);
        coneArea.right = addedSizeByConeAngle;
        // For donuts, the empty space caused by the inner radius is also removed from the bounding box
        // (this only has an effect for angles < 90)
        if ((stgyObj.donutRadius ?? 0) > 0) {
            boxEdgesFromOrigin.bottom -= Math.cos(degtorad(arcAngle)) * (stgyObj.donutRadius ?? 0);
        }
    } else {
        boxEdgesFromOrigin.right = growingSideSize(90);
        coneArea.right = radius;
        if (stgyObj.arcAngle <= 180) {
            boxEdgesFromOrigin.bottom = growingSideSize(stgyObj.arcAngle);
            coneArea.bottom = addedSizeByConeAngle;
        } else {
            boxEdgesFromOrigin.bottom = growingSideSize(180);
            coneArea.bottom = radius;
            if (stgyObj.arcAngle <= 270) {
                boxEdgesFromOrigin.left = growingSideSize(stgyObj.arcAngle);
                coneArea.left = addedSizeByConeAngle;
            } else {
                boxEdgesFromOrigin.left = growingSideSize(270);
                coneArea.left = radius;
            }
        }
    }

    const boxSize = {
        width: boxEdgesFromOrigin.left + boxEdgesFromOrigin.right,
        height: boxEdgesFromOrigin.top + boxEdgesFromOrigin.bottom,
    };
    // 0deg rotated (and not flipped) has the starting edge of the cone point north.
    const relativeConeStart = {
        x: -boxSize.width / 2 + boxEdgesFromOrigin.left,
        y: -boxSize.height / 2 + boxEdgesFromOrigin.bottom,
    };

    let relativeAngle = Math.floor(arcAngle / 2);

    // apply flips
    if (stgyObj.verticalFlip) {
        relativeConeStart.y *= -1;
        relativeAngle = mod360(180 - relativeAngle);
    }
    if (stgyObj.horizontalFlip) {
        relativeConeStart.x *= -1;
        relativeAngle = mod360(360 - relativeAngle);
    }

    const scale = getScale(stgyObj);
    radius *= scale;
    radius -= getStrokeWidth(radius * 2) / 2;

    // apply scaling & rotation
    const absConeStart = rotateCoord(vecMult(relativeConeStart, scale), stgyObj.angle ?? 0);
    const rotation = mod360(relativeAngle + (stgyObj.angle ?? 0));

    return {
        x: boxCenter.x + absConeStart.x,
        y: boxCenter.y + absConeStart.y,
        rotation,
        coneAngle: arcAngle,
        radius,
    };
}

function interpretConeObject(stgyObj: StrategyObject): Partial<CircleZone | ConeZone> {
    const coneProps = interpretConeProperties(
        stgyObj,
        /*fixAngle=*/ (a) => a - (a % 90) + ACTUAL_CONE_ARC_ANGLES[a % 90]!,
        /*growingSideSize=*/ (a) => GROWING_CONE_BOX_SIZE[a % 90]!,
    );
    if (coneProps.coneAngle == 360) {
        return {
            type: ObjectType.Circle,
            x: coneProps.x,
            y: coneProps.y,
            radius: coneProps.radius,
            color: stgyObj.color ?? COLOR_ORANGE,
            ...interpretOpacity(stgyObj, 60),
        };
    } else {
        return {
            type: ObjectType.Cone,
            ...coneProps,
            color: stgyObj.color ?? COLOR_ORANGE,
            ...interpretOpacity(stgyObj, 60),
        };
    }
}

function interpretDonutObject(stgyObj: StrategyObject): Partial<CircleZone | ConeZone | DonutZone | ArcZone> {
    // The angles for donuts do not need adjusting, and the bounding box is slightly different
    const coneProps = interpretConeProperties(
        stgyObj,
        /* fixAngle= */ (a) => a,
        /* growingSideSize= */ (a) =>
            a <= 90 ? GROWING_DONUT_BOX_SIZE_FOR_SMALL_ANGLES[a % 90]! : GROWING_CONE_BOX_SIZE[a % 90]!,
    );

    const commonProps = {
        color: stgyObj.color ?? COLOR_ORANGE,
        x: coneProps.x,
        y: coneProps.y,
        radius: coneProps.radius,
    };

    if (stgyObj.donutRadius === undefined || stgyObj.donutRadius === 0) {
        // the inner radius can be 0, in which case use cones (or a circle) for rendering since we don't
        // allow the inner radius to be 0. This case cannot be delegated to interpretCone, since we do
        // need to keep using the Donut-shape angle & bounding box calculations
        if (coneProps.coneAngle === 360) {
            return donutAsCircle(commonProps);
        } else {
            return donutAsCone(commonProps, coneProps);
        }
    } else {
        const innerRadius = (stgyObj.donutRadius / DEFAULT_CONE_RADIUS) * coneProps.radius;
        if (coneProps.coneAngle === 360) {
            return donutAsDonut(commonProps, innerRadius);
        } else {
            return donutAsArc(commonProps, coneProps, innerRadius);
        }
    }
}

interface CommonDonutProps {
    color: string;
    x: number;
    y: number;
    radius: number;
}

// These conversions don't work in-line without casting (and thus losing some type safety) for some reason.
// TODO: try again after UnknownObject is gone?

function donutAsCircle(commonProps: CommonDonutProps): Partial<CircleZone> {
    return {
        type: ObjectType.Circle,
        ...commonProps,
    };
}

function donutAsCone(commonProps: CommonDonutProps, coneProps: CommonConeProps): Partial<ConeZone> {
    return {
        type: ObjectType.Cone,
        ...commonProps,
        coneAngle: coneProps.coneAngle,
        rotation: coneProps.rotation,
    };
}

function donutAsDonut(commonProps: CommonDonutProps, innerRadius: number): Partial<DonutZone> {
    return {
        type: ObjectType.Donut,
        ...commonProps,
        innerRadius,
    };
}

function donutAsArc(commonProps: CommonDonutProps, coneProps: CommonConeProps, innerRadius: number): Partial<ArcZone> {
    return {
        type: ObjectType.Arc,
        ...commonProps,
        innerRadius,
        rotation: coneProps.rotation,
        coneAngle: coneProps.coneAngle,
    };
}

function interpretArena(stgyBackground: BackgroundType | undefined): Arena {
    switch (stgyBackground ?? 'none') {
        case 'none':
        case 'grey':
            return PRESET_STGY_NONE.arena;
        case 'grey_circle':
            return PRESET_STGY_GREY_CIRCLE.arena;
        case 'grey_square':
            return PRESET_STGY_GREY_SQUARE.arena;
        case 'checkered':
            return PRESET_STGY_CHECKERED.arena;
        case 'checkered_circle':
            return PRESET_STGY_CHECKERED_CIRCLE.arena;
        case 'checkered_square':
            return PRESET_STGY_CHECKERED_SQUARE.arena;
    }
}
