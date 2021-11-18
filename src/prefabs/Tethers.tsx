import {
    IChoiceGroupOption,
    IconButton,
    IStackTokens,
    IStyle,
    mergeStyleSets,
    Position,
    SpinButton,
    Stack,
} from '@fluentui/react';
import Konva from 'konva';
import { NodeConfig } from 'konva/lib/Node';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { LineConfig } from 'konva/lib/shapes/Line';
import { Vector2d } from 'konva/lib/types';
import * as React from 'react';
import { useCallback } from 'react';
import { Arrow, Circle, Group, Line } from 'react-konva';
import { getRecolorFilter } from '../color';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { getCanvasCoord } from '../coord';
import { OpacitySlider } from '../OpacitySlider';
import { getListComponent, ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { ForegroundPortal } from '../render/Portals';
import { COLOR_FUSCHIA, COLOR_GREEN, COLOR_ORANGE, COLOR_SWATCHES, SELECTED_PROPS } from '../render/SceneTheme';
import {
    isEnemy,
    isMarker,
    isMoveable,
    isRadiusObject,
    isResizable,
    isZone,
    ObjectType,
    Scene,
    SceneObject,
    Tether,
    TetherType,
} from '../scene';
import { getObjectById, useScene } from '../SceneProvider';
import { useIsSelected } from '../SelectionProvider';
import { combinations } from '../util';
import { distance, vecAdd, vecMult, vecSub, vecUnit } from '../vector';
import { useSpinChanged } from './CommonProperties';
import { CursorGroup } from './cursor';
import { MagnetMinus, MagnetPlus } from './Magnets';
import { PrefabIcon } from './PrefabIcon';
import { SelectableObject } from './SelectableObject';

const DEFAULT_WIDTH = 6;
const DEFAULT_OPACITY = 80;

const MIN_WIDTH = 2;

interface TetherConfig {
    name: string;
    icon: string;
    color: string;
}

const CONFIGS: Record<TetherType, TetherConfig> = {
    [TetherType.Line]: { name: 'Tether', icon: 'tether.png', color: COLOR_ORANGE },
    [TetherType.Close]: { name: 'Tether (stay together)', icon: 'tether_close.png', color: COLOR_GREEN },
    [TetherType.Far]: { name: 'Tether (stay apart)', icon: 'tether_far.png', color: COLOR_FUSCHIA },
    [TetherType.MinusMinus]: { name: 'Tether (−/−)', icon: 'tether_minus_minus.png', color: COLOR_ORANGE },
    [TetherType.PlusMinus]: { name: 'Tether (+/−)', icon: 'tether_plus_minus.png', color: COLOR_ORANGE },
    [TetherType.PlusPlus]: { name: 'Tether (+/+)', icon: 'tether_plus_plus.png', color: COLOR_ORANGE },
};

function getIconUrl(icon: string) {
    return new URL(`../assets/tether/${icon}`, import.meta.url).toString();
}

function getName(tether: TetherType) {
    return CONFIGS[tether].name;
}

function getIcon(tether: TetherType) {
    return getIconUrl(CONFIGS[tether].icon);
}

function makeIcon(type: TetherType) {
    // eslint-disable-next-line react/display-name
    return () => <PrefabIcon name={getName(type)} icon={getIcon(type)} />;
}

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
    showHighlight: boolean;
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
            <Line {...lineProps} />
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
            <Arrow {...arrowProps1} />
            <Arrow {...arrowProps2} />
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
            <Arrow {...arrowProps} />
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
                    <Circle x={start.x} y={start.y} radius={magnetRadius} {...SELECTED_PROPS} />
                    <Circle x={end.x} y={end.y} radius={magnetRadius} {...SELECTED_PROPS} />
                </>
            )}
            <Line {...lineProps} />
            <ForegroundPortal>
                <StartRenderer x={start.x} y={start.y} radius={magnetRadius} listening={false} />
                <EndRenderer x={end.x} y={end.y} radius={magnetRadius} listening={false} />
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
    const [scene] = useScene();

    const startObject = getObjectById(scene, object.startId);
    const endObject = getObjectById(scene, object.endId);

    const Renderer = getRenderer(object.tether);

    // Cache so overlapping shapes with opacity appear as one object.
    React.useEffect(() => {
        groupRef.current?.cache();
    }, [object, startObject, endObject, groupRef, showHighlight]);

    return (
        <SelectableObject object={object}>
            <CursorGroup cursor="pointer">
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

const stackTokens: IStackTokens = {
    childrenGap: 8,
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

const classNames = mergeStyleSets({
    target: {
        display: 'grid',
        gridTemplate: 'auto / minmax(50%, min-content) min-content minmax(50%, min-content)',
        gridColumnGap: '4px',
        overflow: 'hidden',
    } as IStyle,
});

function getIconColorFilter(object: Tether) {
    switch (object.tether) {
        case TetherType.MinusMinus:
        case TetherType.PlusMinus:
        case TetherType.PlusPlus:
            return undefined;

        default:
            return getRecolorFilter(object.color);
    }
}

const TetherDetails: React.FC<ListComponentProps<Tether>> = ({ object }) => {
    const [scene, dispatch] = useScene();
    const filter = React.useMemo(() => getIconColorFilter(object), [object]);

    const onDelete = () => dispatch({ type: 'remove', ids: object.id });

    const startObj = getObjectById(scene, object.startId);
    const endObj = getObjectById(scene, object.endId);

    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <Stack.Item>
                <PrefabIcon
                    icon={getIcon(object.tether)}
                    name={getName(object.tether)}
                    filter={filter}
                    shouldFadeIn={false}
                />
            </Stack.Item>
            <Stack.Item grow className={classNames.target}>
                <div>{getTargetNode(startObj)}</div>
                <div>{getTargetNode(endObj)}</div>
            </Stack.Item>
            <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />
        </Stack>
    );
};

registerListComponent<Tether>(ObjectType.Tether, TetherDetails);

const tetherOptions: IChoiceGroupOption[] = [
    TetherType.Line,
    TetherType.Close,
    TetherType.Far,
    TetherType.MinusMinus,
    TetherType.PlusMinus,
    TetherType.PlusPlus,
].map((tether) => {
    const icon = getIcon(tether);
    return {
        key: tether,
        text: getName(tether),
        imageSrc: icon,
        selectedImageSrc: icon,
    };
});

const TetherEditControl: React.FC<PropertiesControlProps<Tether>> = ({ object }) => {
    const [, dispatch] = useScene();

    const onTetherChanged = useCallback(
        (tether: TetherType) => dispatch({ type: 'update', value: { ...object, tether } }),
        [dispatch, object],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', value: { ...object, color } }),
        [dispatch, object],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', value: { ...object, opacity } });
            }
        },
        [dispatch, object],
    );

    const onWidthChanged = useSpinChanged(
        (width: number) => dispatch({ type: 'update', value: { ...object, width } }),
        [dispatch, object],
    );

    return (
        <Stack>
            <CompactChoiceGroup
                label="Tether type"
                padding={4}
                options={tetherOptions}
                selectedKey={object.tether}
                onChange={(e, option) => onTetherChanged(option?.key as TetherType)}
            />
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <SpinButton
                label="Width"
                labelPosition={Position.top}
                value={object.width.toString()}
                onChange={onWidthChanged}
                min={MIN_WIDTH}
                step={2}
            />
        </Stack>
    );
};

registerPropertiesControl<Tether>(ObjectType.Tether, TetherEditControl);

export const TetherLine = makeIcon(TetherType.Line);
export const TetherClose = makeIcon(TetherType.Close);
export const TetherFar = makeIcon(TetherType.Far);
export const TetherMinusMinus = makeIcon(TetherType.MinusMinus);
export const TetherPlusMinus = makeIcon(TetherType.PlusMinus);
export const TetherPlusPlus = makeIcon(TetherType.PlusPlus);

export function makeTether(startId: number, endId: number, tether = TetherType.Line): Omit<Tether, 'id'> {
    return {
        type: ObjectType.Tether,
        tether,
        startId,
        endId,
        width: DEFAULT_WIDTH,
        color: CONFIGS[tether].color,
        opacity: DEFAULT_OPACITY,
    };
}

export function makeTethers(objects: readonly SceneObject[], tether = TetherType.Line): Omit<Tether, 'id'>[] {
    const result: Omit<Tether, 'id'>[] = [];

    for (const [start, end] of combinations(objects)) {
        if (isMoveable(start) && isMoveable(end)) {
            result.push(makeTether(start.id, end.id, tether));
        }
    }

    return result;
}
