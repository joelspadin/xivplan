import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, KonvaNodeEvents, Rect } from 'react-konva';
import { getCanvasCoord } from '../coord';
import { ControlsPortal } from '../render/Portals';
import { useStage } from '../render/StageProvider';
import { useScene } from '../SceneProvider';

export const CONTROL_POINT_BORDER_COLOR = '#00a1ff';

export enum HandleStyle {
    Square,
    Diamond,
}

export interface ControlPointConfig<T extends Vector2d, S> {
    /**
     * Returns a position for each control point relative to the center of the
     * object.
     *
     * @param pointerPos Position of the mouse relative to the center of the object,
     * or undefined if not transforming.
     */
    positionFunc(object: T, pointerPos: Vector2d | undefined): Vector2d[];
    /**
     * Gets the cursor icon to use for a control point.
     */
    cursorFunc?(controlIndex: number): string;
    /**
     * Returns a state object to pass to the child when not transforming.
     */
    stateFunc(object: T): S;
    /**
     * Returns a state object to pass to the child when transforming.
     *
     * @param controlPos Position of the control point being moved.
     * @param controlIndex Index of the control point being moved.
     */
    transformStateFunc(object: T, controlPos: Vector2d, controlIndex: number): S;
    /**
     * Renders the border or bounding box.
     *
     * @param controlPoints Positions from positionFunc().
     */
    onRenderBorder?(object: T, state: S, controlPoints: readonly Vector2d[]): React.ReactElement | null;

    style?: HandleStyle;
}

export interface ControlPointManagerProps<T, S> {
    object: T;
    visible?: boolean;
    onActive?(active: boolean): void;
    onTransformEnd?(state: S): void;
    children: (state: S) => React.ReactElement;
}

const SQUARE_FILL_COLOR = '#ffffff';
const SQUARE_STROKE_COLOR = CONTROL_POINT_BORDER_COLOR;
const DIAMOND_FILL_COLOR = '#fafa00';
const DIAMOND_STROKE_COLOR = '#adad00';

const CONTROL_POINT_SIZE = 10;
const CONTROL_POINT_OFFSET = { x: CONTROL_POINT_SIZE / 2, y: CONTROL_POINT_SIZE / 2 };

interface TransformId {
    controlIndex: number;
    handleOffset: Vector2d;
    pointerPos: Vector2d;
}

function getHandleCenter(transform: TransformId) {
    return {
        x: transform.pointerPos.x - transform.handleOffset.x,
        y: transform.pointerPos.y + transform.handleOffset.y,
    };
}

interface HandleProps extends Konva.NodeConfig, KonvaNodeEvents {
    style: HandleStyle;
}

const SquareHandle: React.FC<Konva.NodeConfig> = (props) => {
    return (
        <Rect
            {...props}
            width={CONTROL_POINT_SIZE}
            height={CONTROL_POINT_SIZE}
            offset={CONTROL_POINT_OFFSET}
            fill={SQUARE_FILL_COLOR}
            stroke={SQUARE_STROKE_COLOR}
            strokeWidth={1}
        />
    );
};

const DiamondHandle: React.FC<Konva.NodeConfig> = (props) => {
    return (
        <Rect
            {...props}
            width={CONTROL_POINT_SIZE}
            height={CONTROL_POINT_SIZE}
            offset={CONTROL_POINT_OFFSET}
            fill={DIAMOND_FILL_COLOR}
            stroke={DIAMOND_STROKE_COLOR}
            strokeWidth={1}
            rotation={45}
        />
    );
};

const Handle: React.FC<HandleProps> = ({ style, ...props }) => {
    switch (style) {
        case HandleStyle.Square:
            return <SquareHandle {...props} />;

        case HandleStyle.Diamond:
            return <DiamondHandle {...props} />;
    }
};

function getControlPos(positions: readonly Vector2d[], index: number) {
    const controlPos = positions[index];
    if (controlPos === undefined) {
        throw new Error(`Invalid control point index ${index}`);
    }

    return controlPos;
}

export function createControlPointManager<T extends Vector2d, S>(
    config: ControlPointConfig<T, S>,
): React.VFC<ControlPointManagerProps<T, S>> {
    const style = config.style ?? HandleStyle.Square;

    const ControlPointManager: React.VFC<ControlPointManagerProps<T, S>> = ({
        children,
        onActive,
        onTransformEnd,
        object,
        visible,
    }) => {
        const [scene] = useScene();
        const stage = useStage();
        const [transform, setTransform] = useState<TransformId>();
        const groupRef = useRef<Konva.Group>(null);

        const { state, positions } = useMemo(() => {
            if (!transform) {
                return {
                    positions: config.positionFunc(object, undefined),
                    state: config.stateFunc(object),
                };
            }

            const positions = config.positionFunc(object, getHandleCenter(transform));
            const controlPos = getControlPos(positions, transform.controlIndex);

            return {
                positions,
                state: config.transformStateFunc(object, controlPos, transform.controlIndex),
            };
        }, [transform, object]);

        const getPointerPos = useCallback(() => {
            if (!groupRef.current) {
                return { x: 0, y: 0 };
            }

            const { x, y } = groupRef.current.getRelativePointerPosition();
            return { x, y: -y };
        }, [groupRef, stage]);

        const getTransformStart = useCallback(
            (i: number) => {
                return (e: KonvaEventObject<Event>) => {
                    e.evt.stopPropagation();

                    const pointerPos = getPointerPos();
                    const handleCornerOffset = e.target.getRelativePointerPosition();
                    const handleOffset = {
                        x: handleCornerOffset.x - e.target.offsetX(),
                        y: handleCornerOffset.y - e.target.offsetY(),
                    };

                    onActive?.(true);
                    setTransform({ pointerPos, handleOffset, controlIndex: i });
                };
            },
            [onActive, setTransform, getPointerPos],
        );

        useEffect(() => {
            if (!transform) {
                return;
            }

            const handleMove = () => {
                const pointerPos = getPointerPos();
                setTransform({ ...transform, pointerPos });
            };

            const handleEnd = (e: Event) => {
                e.stopPropagation();

                onActive?.(false);
                setTransform(undefined);

                const pointerPos = getPointerPos();
                const positions = config.positionFunc(object, getHandleCenter({ ...transform, pointerPos }));
                const controlPos = getControlPos(positions, transform.controlIndex);
                const state = config.transformStateFunc(object, controlPos, transform.controlIndex);
                onTransformEnd?.(state);
            };

            // As long as we are transforming, handle mouse events on the whole screen.
            // Capture mouse up events so we can prevent other Konva nodes from handling
            // them and preventing the transform from ever ending.
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('mouseup', handleEnd, true);
            window.addEventListener('touchend', handleEnd, true);

            return () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('mouseup', handleEnd, true);
                window.removeEventListener('touchend', handleEnd, true);
            };
        }, [!transform, setTransform, getPointerPos]);

        const setCursor = useCallback(
            (cursor: string) => {
                if (stage) {
                    stage.container().style.cursor = cursor;
                }
            },
            [stage],
        );

        const center = getCanvasCoord(scene, object);

        return (
            <>
                {children(state)}
                <ControlsPortal>
                    <Group ref={groupRef} x={center.x} y={center.y} visible={visible}>
                        {config.onRenderBorder?.(object, state, positions)}
                        {positions.map((pos, i) => (
                            <Handle
                                key={i}
                                x={pos.x}
                                y={pos.y}
                                style={style}
                                onMouseEnter={() => setCursor(config.cursorFunc?.(i) ?? 'default')}
                                onMouseLeave={() => setCursor('default')}
                                onMouseDown={getTransformStart(i)}
                                onTouchStart={getTransformStart(i)}
                            />
                        ))}
                    </Group>
                </ControlsPortal>
            </>
        );
    };

    return ControlPointManager;
}
