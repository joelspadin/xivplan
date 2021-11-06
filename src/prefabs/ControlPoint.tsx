import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, KonvaNodeEvents, Rect } from 'react-konva';
import { getCanvasCoord, rotateCoord } from '../coord';
import { ControlsPortal } from '../render/Portals';
import { useStage } from '../render/StageProvider';
import { useScene } from '../SceneProvider';

export const CONTROL_POINT_BORDER_COLOR = '#00a1ff';

export enum HandleStyle {
    Square,
    Diamond,
}

export interface Handle extends Vector2d {
    readonly id: number;
    readonly cursor?: string;
    readonly style?: HandleStyle;
}

export interface HandleFuncProps {
    pointerPos?: Vector2d;
    activeHandleId?: number;
}

export interface ControlPointConfig<T extends Vector2d, S, P> {
    /**
     * Returns each control point handle. Positions are relative to the center of the
     * object.
     */
    handleFunc(object: T, handle: HandleFuncProps, props: Readonly<P>): Handle[];
    /**
     * Returns a state object to pass to the child.
     */
    stateFunc(object: T, handle: HandleFuncProps, props: Readonly<P>): S;

    getRotation?(object: T, handle: HandleFuncProps, props: Readonly<P>): number;
    /**
     * Renders the border or bounding box.
     */
    onRenderBorder?(object: T, state: S, props: Readonly<P>): React.ReactElement | null;
}

export interface ControlPointManagerPropsBase<T, S> {
    object: T;
    visible?: boolean;
    onActive?(active: boolean): void;
    onTransformEnd?(state: S): void;
    children: (state: S) => React.ReactElement;
}

export type ControlPointManagerProps<T, S, P> = ControlPointManagerPropsBase<T, S> & P;

const SQUARE_FILL_COLOR = '#ffffff';
const SQUARE_STROKE_COLOR = CONTROL_POINT_BORDER_COLOR;
const DIAMOND_FILL_COLOR = '#fafa00';
const DIAMOND_STROKE_COLOR = '#adad00';

const CONTROL_POINT_SIZE = 10;
const CONTROL_POINT_OFFSET = { x: CONTROL_POINT_SIZE / 2, y: CONTROL_POINT_SIZE / 2 };

interface TransformState {
    handleId: number;
    /** Offset of pointer relative to handle */
    handleOffset: Vector2d;
    pointerPos: Vector2d;
}

function getHandleCenter(transform: TransformState) {
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

function getHandleId(handles: readonly Handle[], index: number): number {
    const activeHandle = handles[index];
    if (activeHandle === undefined) {
        throw new Error(`Invalid control point index ${index}`);
    }

    return activeHandle.id;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createControlPointManager<T extends Vector2d, S, P = {}>(
    config: ControlPointConfig<T, S, P>,
): React.VFC<ControlPointManagerProps<T, S, P>> {
    const ControlPointManager: React.VFC<ControlPointManagerProps<T, S, P>> = (props) => {
        const { children, onActive, onTransformEnd, object, visible } = props;

        const [scene] = useScene();
        const stage = useStage();
        const [transform, setTransform] = useState<TransformState>();
        const groupRef = useRef<Konva.Group>(null);

        const { state, handles, rotation } = useMemo(() => {
            let pointerPos: Vector2d | undefined;
            if (transform) {
                pointerPos = getHandleCenter(transform);
            }

            const activeHandleId = transform?.handleId ?? 0;
            const handleProps = { pointerPos, activeHandleId };

            const handles = config.handleFunc(object, handleProps, props);
            const state = config.stateFunc(object, handleProps, props);
            const rotation = config.getRotation?.(object, handleProps, props) ?? 0;

            return { handles, state, rotation };
        }, [transform, object, props]);

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

                    // Offset is relative to rotated object, but we want the offset
                    // in screen coordinates, so back out the rotation.
                    const handleOffset = rotateCoord(
                        {
                            x: handleCornerOffset.x - e.target.offsetX(),
                            y: handleCornerOffset.y - e.target.offsetY(),
                        },
                        -rotation,
                    );

                    const handleId = getHandleId(config.handleFunc(object, {}, props), i);

                    onActive?.(true);
                    setTransform({ pointerPos, handleOffset, handleId });
                };
            },
            [onActive, setTransform, getPointerPos, object, rotation, props],
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

                const pointerPos = getHandleCenter({ ...transform, pointerPos: getPointerPos() });

                const activeHandleId = transform?.handleId ?? 0;
                const handleProps = { pointerPos, activeHandleId };
                const state = config.stateFunc(object, handleProps, props);
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
        }, [!transform, setTransform, getPointerPos, props]);

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
                    {/* Rotating this group would affect the pointer position, so rotate an inner group instead. */}
                    <Group ref={groupRef} x={center.x} y={center.y} visible={visible}>
                        <Group rotation={rotation}>
                            {config.onRenderBorder?.(object, state, props)}
                            {handles.map((handle, i) => (
                                <Handle
                                    key={i}
                                    x={handle.x}
                                    y={handle.y}
                                    style={handle.style ?? HandleStyle.Square}
                                    onMouseEnter={() => setCursor(handle.cursor ?? 'default')}
                                    onMouseLeave={() => setCursor('default')}
                                    onMouseDown={getTransformStart(i)}
                                    onTouchStart={getTransformStart(i)}
                                />
                            ))}
                        </Group>
                    </Group>
                </ControlsPortal>
            </>
        );
    };

    return ControlPointManager;
}
