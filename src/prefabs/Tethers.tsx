import { makeStyles } from '@fluentui/react-components';
import Konva from 'konva';
import { NodeConfig } from 'konva/lib/Node';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { LineConfig } from 'konva/lib/shapes/Line';
import { Vector2d } from 'konva/lib/types';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { Arrow, Circle, Group, Line } from 'react-konva';
import { CursorGroup } from '../CursorGroup';
import { getObjectById, useScene } from '../SceneProvider';
import { getCanvasCoord } from '../coord';
import { EditMode } from '../editMode';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, getListComponent, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { ForegroundPortal } from '../render/Portals';
import { LayerName } from '../render/layers';
import { SELECTED_PROPS, sceneVars } from '../render/sceneTheme';
import {
    FakeCursorObject,
    ObjectType,
    Scene,
    SceneObject,
    Tether,
    TetherType,
    isEnemy,
    isMarker,
    isMoveable,
    isRadiusObject,
    isResizable,
    isZone,
} from '../scene';
import { selectNone, useIsSelected, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';
import { useKonvaCache } from '../useKonvaCache';
import { useTetherConfig } from '../useTetherConfig';
import { distance, vecAdd, vecMult, vecSub, vecUnit } from '../vector';
import { HideCutoutGroup, HideGroup } from './HideGroup';
import { MagnetMinus, MagnetPlus } from './Magnets';
import { PREFAB_ICON_SIZE } from './PrefabIconStyles';
import { PrefabToggle } from './PrefabToggle';
import { SelectableObject } from './SelectableObject';
import { getTetherName, makeTether } from './TetherConfig';
import { TetherIcon } from './TetherIcon';

interface TetherButtonProps {
    tether: TetherType;
}

const TetherButton: React.FC<TetherButtonProps> = ({ tether }) => {
    const classes = useStyles();
    const [, setSelection] = useSelection();
    const [editMode, setEditMode] = useEditMode();
    const [tetherConfig, setTetherConfig] = useTetherConfig();

    const checked = editMode === EditMode.Tether && tetherConfig.tether === tether;

    const onClick = useCallback(() => {
        if (checked) {
            setEditMode(EditMode.Normal);
        } else {
            setEditMode(EditMode.Tether);
            setSelection(selectNone());
            setTetherConfig({ tether });
        }
    }, [checked, tether, setEditMode, setSelection, setTetherConfig]);

    const label = useMemo(() => getTetherName(tether), [tether]);

    return (
        <PrefabToggle
            label={label}
            icon={{ children: <TetherIcon tetherType={tether} />, className: classes.icon }}
            onClick={onClick}
            checked={checked}
        />
    );
};

const INVALID_START_POS: Vector2d = { x: -20, y: 0 };
const INVALID_END_POS: Vector2d = { x: 20, y: 0 };

function getTargetPoints(
    scene: Scene,
    startObject: SceneObject | undefined,
    endObject: SceneObject | undefined,
): [Vector2d, Vector2d] {
    const startPos = isMoveable(startObject) ? startObject : INVALID_START_POS;
    const endPos = isMoveable(endObject) ? endObject : INVALID_END_POS;

    return [getCanvasCoord(scene, startPos), getCanvasCoord(scene, endPos)];
}

function isGroundObject(object: SceneObject) {
    return isZone(object) || isEnemy(object) || isMarker(object);
}

function getTargetOffset(object: SceneObject | undefined): number {
    if (!object) {
        return 0;
    }

    let radius = 0;

    if (isResizable(object)) {
        radius = (object.width + object.height) / 4;
    }
    if (isRadiusObject(object)) {
        radius = object.radius;
    }

    // Objects on the ground layer should typically have tethers reach their
    // centers, but small objects on the background layer are hard to grab if
    // tethers are allowed to cover them.
    if (isGroundObject(object)) {
        return radius > 35 ? 0 : radius;
    }

    return radius;
}

function getTetherPoints(
    scene: Scene,
    startObject: SceneObject | undefined,
    endObject: SceneObject | undefined,
    addOffset = 0,
): [Vector2d, Vector2d] {
    const [start, end] = getTargetPoints(scene, startObject, endObject);

    const unit = vecUnit(vecSub(end, start));
    const dist = distance(start, end);

    const startOffset = Math.min(dist / 2, getTargetOffset(startObject) + addOffset);
    const endOffset = Math.min(dist / 2, getTargetOffset(endObject) + addOffset);

    return [vecAdd(start, vecMult(unit, startOffset)), vecSub(end, vecMult(unit, endOffset))];
}

function getSelectedProps(object: Tether): NodeConfig {
    return {
        ...SELECTED_PROPS,
        strokeWidth: object.width + 2 * (SELECTED_PROPS.strokeWidth ?? 0),
        opacity: 1,
    };
}

interface TetherProps extends RendererProps<Tether> {
    scene: Scene;
    showHighlight?: boolean;
    startObject: SceneObject | undefined;
    endObject: SceneObject | undefined;
}

const LineTetherRenderer: React.FC<TetherProps> = ({ object, scene, showHighlight, startObject, endObject }) => {
    const [start, end] = getTetherPoints(scene, startObject, endObject);
    const lineProps: LineConfig = {
        points: [start.x, start.y, end.x, end.y],
        fill: object.color,
        stroke: object.color,
        strokeWidth: object.width,
        lineCap: 'round',
    };

    return (
        <>
            {showHighlight && <Line {...lineProps} {...getSelectedProps(object)} />}

            <HideCutoutGroup>
                <Line {...lineProps} />
            </HideCutoutGroup>
        </>
    );
};

const CloseTetherRenderer: React.FC<TetherProps> = ({ object, scene, showHighlight, startObject, endObject }) => {
    const [start, end] = getTetherPoints(scene, startObject, endObject);
    const center = vecMult(vecAdd(start, end), 0.5);
    const offset = vecMult(vecUnit(vecSub(end, start)), object.width * 1.25);

    const c1 = vecSub(center, offset);
    const c2 = vecAdd(center, offset);

    const commonProps: Partial<ArrowConfig> = {
        fill: object.color,
        stroke: object.color,
        strokeWidth: object.width,
        lineCap: 'round',
        pointerAtEnding: true,
    };

    const arrowProps1: ArrowConfig = {
        points: [start.x, start.y, c1.x, c1.y],
        ...commonProps,
    };
    const arrowProps2: ArrowConfig = {
        points: [end.x, end.y, c2.x, c2.y],
        ...commonProps,
    };

    return (
        <>
            {showHighlight && (
                <>
                    <Arrow {...arrowProps1} {...getSelectedProps(object)} />
                    <Arrow {...arrowProps2} {...getSelectedProps(object)} />
                </>
            )}
            <HideCutoutGroup>
                <Arrow {...arrowProps1} />
                <Arrow {...arrowProps2} />
            </HideCutoutGroup>
        </>
    );
};

const FarTetherRenderer: React.FC<TetherProps> = ({ object, scene, showHighlight, startObject, endObject }) => {
    const [start, end] = getTetherPoints(scene, startObject, endObject, object.width);

    const arrowProps: ArrowConfig = {
        points: [start.x, start.y, end.x, end.y],
        fill: object.color,
        stroke: object.color,
        strokeWidth: object.width,
        lineCap: 'round',
        pointerAtBeginning: true,
        pointerAtEnding: true,
    };

    return (
        <>
            {showHighlight && <Arrow {...arrowProps} {...getSelectedProps(object)} />}
            <HideCutoutGroup>
                <Arrow {...arrowProps} />
            </HideCutoutGroup>
        </>
    );
};

type MagnetType = '+' | '-';

function getMagnetRenderer(type: MagnetType) {
    return type === '+' ? MagnetPlus : MagnetMinus;
}

interface MagnetTetherProps extends TetherProps {
    startType: MagnetType;
    endType: MagnetType;
}

const MagnetTetherRenderer: React.FC<MagnetTetherProps> = ({
    object,
    scene,
    showHighlight,
    startObject,
    endObject,
    startType,
    endType,
}) => {
    const [start, end] = getTetherPoints(scene, startObject, endObject, object.width);

    const lineProps: LineConfig = {
        points: [start.x, start.y, end.x, end.y],
        fill: object.color,
        stroke: object.color,
        strokeWidth: object.width,
        lineCap: 'round',
    };
    const magnetRadius = object.width * 2;

    const StartRenderer = getMagnetRenderer(startType);
    const EndRenderer = getMagnetRenderer(endType);

    return (
        <>
            {showHighlight && (
                <>
                    <Line {...lineProps} {...getSelectedProps(object)} />
                    <HideGroup>
                        <Circle x={start.x} y={start.y} radius={magnetRadius} {...SELECTED_PROPS} />
                        <Circle x={end.x} y={end.y} radius={magnetRadius} {...SELECTED_PROPS} />
                    </HideGroup>
                </>
            )}
            <HideCutoutGroup>
                <Line {...lineProps} />
            </HideCutoutGroup>
            <ForegroundPortal>
                <HideGroup>
                    <StartRenderer x={start.x} y={start.y} radius={magnetRadius} listening={false} />
                    <EndRenderer x={end.x} y={end.y} radius={magnetRadius} listening={false} />
                </HideGroup>
            </ForegroundPortal>
        </>
    );
};

const MinusMinusTetherRenderer: React.FC<TetherProps> = (props) => (
    <MagnetTetherRenderer {...props} startType="-" endType="-" />
);

const PlusMinusTetherRenderer: React.FC<TetherProps> = (props) => (
    <MagnetTetherRenderer {...props} startType="+" endType="-" />
);

const PlusPlusTetherRenderer: React.FC<TetherProps> = (props) => (
    <MagnetTetherRenderer {...props} startType="+" endType="+" />
);

function getRenderer(type: TetherType) {
    switch (type) {
        case TetherType.Line:
            return LineTetherRenderer;

        case TetherType.Close:
            return CloseTetherRenderer;

        case TetherType.Far:
            return FarTetherRenderer;

        case TetherType.MinusMinus:
            return MinusMinusTetherRenderer;

        case TetherType.PlusMinus:
            return PlusMinusTetherRenderer;

        case TetherType.PlusPlus:
            return PlusPlusTetherRenderer;
    }
}

const TetherRenderer: React.FC<RendererProps<Tether>> = ({ object }) => {
    const showHighlight = useIsSelected(object);
    const groupRef = React.useRef<Konva.Group>(null);
    const [editMode] = useEditMode();
    const { scene } = useScene();

    const startObject = getObjectById(scene, object.startId);
    const endObject = getObjectById(scene, object.endId);

    const Renderer = getRenderer(object.tether);

    const isSelectable = editMode === EditMode.Normal;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [object, startObject, endObject, showHighlight]);

    return (
        <SelectableObject object={object}>
            <CursorGroup cursor={isSelectable ? 'pointer' : undefined}>
                <Group ref={groupRef} opacity={object.opacity / 100}>
                    <Renderer
                        object={object}
                        scene={scene}
                        showHighlight={showHighlight}
                        startObject={startObject}
                        endObject={endObject}
                    />
                </Group>
            </CursorGroup>
        </SelectableObject>
    );
};

registerRenderer<Tether>(ObjectType.Tether, LayerName.Default, TetherRenderer);

export interface TetherToCursorProps {
    startObject: SceneObject | undefined;
    cursorPos: Vector2d;
    tether: TetherType;
}

export const TetherToCursor: React.FC<TetherToCursorProps> = ({ startObject, cursorPos, tether }) => {
    const groupRef = React.useRef<Konva.Group>(null);
    const { scene } = useScene();

    const fakeTetherObject = useMemo(() => {
        return {
            id: -1,
            ...makeTether(-1, -1, tether),
        };
    }, [tether]);

    const fakeCursorObject = useMemo(() => {
        return {
            type: ObjectType.Cursor,
            id: -1,
            ...cursorPos,
        } as FakeCursorObject;
    }, [cursorPos]);

    const Renderer = getRenderer(tether);

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [startObject, cursorPos, tether]);

    return (
        <Group ref={groupRef} opacity={0.5}>
            <Renderer object={fakeTetherObject} scene={scene} startObject={startObject} endObject={fakeCursorObject} />
        </Group>
    );
};

const UnknownTargetComponent: React.FC = () => {
    return <span>(invalid)</span>;
};

function getTargetNode(object: SceneObject | undefined) {
    if (object) {
        const Component = getListComponent(object);
        return <Component object={object} isNested />;
    }

    return <UnknownTargetComponent />;
}

// function getIconColorFilter(object: Tether) {
//     switch (object.tether) {
//         case TetherType.MinusMinus:
//         case TetherType.PlusMinus:
//         case TetherType.PlusPlus:
//             return undefined;

//         default:
//             return getRecolorFilter(object.color);
//     }
// }

const TetherDetails: React.FC<ListComponentProps<Tether>> = ({ object, ...props }) => {
    const classes = useStyles();
    const { scene } = useScene();
    const name = getTetherName(object.tether);
    // const filter = React.useMemo(() => getIconColorFilter(object), [object]);

    const startObj = getObjectById(scene, object.startId);
    const endObj = getObjectById(scene, object.endId);

    const style: React.CSSProperties = {
        [sceneVars.colorZoneOrange]: object.color,
    };

    return (
        <DetailsItem
            object={object}
            icon={<TetherIcon tetherType={object.tether} style={style} />}
            name={name}
            {...props}
        >
            <div className={classes.targets}>
                <div>{getTargetNode(startObj)}</div>
                <div>{getTargetNode(endObj)}</div>
            </div>
        </DetailsItem>
    );
};

registerListComponent<Tether>(ObjectType.Tether, TetherDetails);

export const TetherLine: React.FC = () => <TetherButton tether={TetherType.Line} />;
export const TetherClose: React.FC = () => <TetherButton tether={TetherType.Close} />;
export const TetherFar: React.FC = () => <TetherButton tether={TetherType.Far} />;
export const TetherMinusMinus: React.FC = () => <TetherButton tether={TetherType.MinusMinus} />;
export const TetherPlusMinus: React.FC = () => <TetherButton tether={TetherType.PlusMinus} />;
export const TetherPlusPlus: React.FC = () => <TetherButton tether={TetherType.PlusPlus} />;

const useStyles = makeStyles({
    icon: {
        width: `${PREFAB_ICON_SIZE}px`,
        height: `${PREFAB_ICON_SIZE}px`,
        margin: `-${(PREFAB_ICON_SIZE - 20) / 2}px`,
    },

    targets: {
        display: 'grid',
        gridTemplate: 'auto / minmax(50%, min-content) min-content minmax(50%, min-content)',
        gridColumnGap: '4px',
        overflow: 'hidden',

        flexGrow: 1,
    },
});
