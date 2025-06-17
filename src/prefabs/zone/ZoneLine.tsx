import { useCallback, useMemo, useState } from 'react';
import { Circle, Group, Rect } from 'react-konva';
import Icon from '../../assets/zone/line.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_AOE_COLOR,
    DEFAULT_AOE_OPACITY,
    sceneVars,
    SELECTED_PROPS,
} from '../../render/sceneTheme';
import { LineZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { usePanelDrag } from '../../usePanelDrag';
import { distance, getDistanceFromLine, VEC_ZERO, vecAtAngle } from '../../vector';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { useShowHighlight, useShowResizer } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const NAME = 'Line';

const DEFAULT_WIDTH = 100;
const DEFAULT_LENGTH = 250;

const ICON_SIZE = 32;

export const ZoneLine: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.Line,
                    },
                    offset: {
                        x: offset.x,
                        y: offset.y - ICON_SIZE / 2,
                    },
                });
            }}
        />
    );
};

registerDropHandler<LineZone>(ObjectType.Line, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Cone,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_WIDTH,
            length: DEFAULT_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const LineDetails: React.FC<ListComponentProps<LineZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<LineZone>(ObjectType.Line, LineDetails);

enum HandleId {
    Length,
    Width,
}

interface LineState {
    length: number;
    width: number;
    rotation: number;
}

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

const OUTSET = 2;

function getLength(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        return Math.max(MIN_LINE_LENGTH, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.length;
}

function getRotation(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getWidth(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId == HandleId.Width) {
        const start = VEC_ZERO;
        const end = vecAtAngle(object.rotation);
        const distance = getDistanceFromLine(start, end, pointerPos);

        return Math.max(MIN_LINE_WIDTH, Math.round(distance * 2));
    }

    return object.width;
}

const LineControlPoints = createControlPointManager<LineZone, LineState>({
    handleFunc: (object, handle) => {
        const length = getLength(object, handle) + OUTSET;
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        const x = width / 2;
        const y = -length / 2;

        return [
            { id: HandleId.Length, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -length },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: x, y: y },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: -x, y: y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const length = getLength(object, handle);
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        return { length, width, rotation };
    },
    onRenderBorder: (object, state) => {
        const strokeWidth = 1;
        const width = state.width + strokeWidth * 2;
        const length = state.length + strokeWidth * 2;

        return (
            <>
                <Rect
                    x={-width / 2}
                    y={-length + strokeWidth}
                    width={width}
                    height={length}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={strokeWidth}
                    fillEnabled={false}
                />
                <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
            </>
        );
    },
});

interface LineRendererProps extends RendererProps<LineZone> {
    length: number;
    width: number;
    rotation: number;
    isDragging?: boolean;
}

const LineRenderer: React.FC<LineRendererProps> = ({ object, length, width, rotation, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(length, width), object.hollow),
        [object.color, object.opacity, length, width, object.hollow],
    );

    const x = -width / 2;
    const y = -length;
    const highlightOffset = style.strokeWidth;
    const highlightWidth = width + highlightOffset;
    const highlightLength = length + highlightOffset;

    return (
        <Group rotation={rotation}>
            {showHighlight && (
                <Rect
                    x={x}
                    y={y}
                    width={highlightWidth}
                    height={highlightLength}
                    offsetX={highlightOffset / 2}
                    offsetY={highlightOffset / 2}
                    {...SELECTED_PROPS}
                />
            )}
            <HideGroup>
                <Rect x={x} y={y} width={width} height={length} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: LineZone, state: LineState) {
    return state.length !== object.length || state.rotation !== object.rotation || state.width !== object.width;
}

const LineContainer: React.FC<RendererProps<LineZone>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: LineState) => {
            state.rotation = Math.round(state.rotation);
            state.width = Math.round(state.width);

            if (!stateChanged(object, state)) {
                return;
            }

            dispatch({ type: 'update', value: { ...object, ...state } });
        },
        [dispatch, object],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <LineControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => <LineRenderer object={object} isDragging={dragging || resizing} {...props} />}
                </LineControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<LineZone>(ObjectType.Line, LayerName.Ground, LineContainer);
