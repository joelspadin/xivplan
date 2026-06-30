import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Vector2d } from 'konva/lib/types';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Group } from 'react-konva';
import { getCanvasCoord, rotateCoord } from '../coord';
import { ControlsPortal } from '../render/Portals';
import { useStage } from '../render/stage';
import type { Scene } from '../scene';
import { useScene } from '../SceneProvider';
import { HandleStyle, type EventWithModifierKeys, type Handle, type HandleFuncProps } from './controlpoints';
import { Handle as HandleComponent } from './Handle';

/**
 * Some control points may change the object's location. The updated location should be set in the state
 * object so that the transformed control points can be rendered properly.
 */
export interface ControlledObjectStateBase {
    x?: number;
    y?: number;
}

export interface ControlPointConfig<T extends Vector2d, S extends ControlledObjectStateBase, P> {
    /**
     * Returns each control point handle. Positions are relative to the center of the
     * original object.
     */
    handleFunc(
        scene: Readonly<Scene>,
        object: T,
        handle: HandleFuncProps,
        props: Readonly<P>,
        state: Readonly<S>,
    ): Handle[];
    /**
     * Returns a state object to pass to the child.
     */
    stateFunc(scene: Readonly<Scene>, object: T, handle: HandleFuncProps, props: Readonly<P>): S;

    getRotation?(scene: Readonly<Scene>, object: T, handle: HandleFuncProps, props: Readonly<P>): number;
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

interface TransformState {
    handleId: number;
    /** Offset of pointer relative to handle */
    handleOffset: Vector2d;
    pointerPos: Vector2d;
    modifierKeys: EventWithModifierKeys;
}

function getHandleCenter(transform: TransformState) {
    return {
        x: transform.pointerPos.x - transform.handleOffset.x,
        y: transform.pointerPos.y + transform.handleOffset.y,
    };
}

function getHandleId(handles: readonly Handle[], index: number): number {
    const activeHandle = handles[index];
    if (activeHandle === undefined) {
        throw new Error(`Invalid control point index ${index}`);
    }

    return activeHandle.id;
}

/**
 * @type T the object type to control
 * @type S a representation of the properties of the object that can be modified through the control points
 * @type P the interface for any (constant) custom properties to pass along to underlying functions
 */
export function createControlPointManager<T extends Vector2d, S extends ControlledObjectStateBase, P = unknown>(
    config: ControlPointConfig<T, S, P>,
): React.FC<ControlPointManagerProps<T, S, P>> {
    const ControlPointManager: React.FC<ControlPointManagerProps<T, S, P>> = (props) => {
        const { children, onActive, onTransformEnd, object, visible } = props;

        const { scene, arena } = useScene();
        const stage = useStage();
        const [transform, setTransform] = useState<TransformState>();
        const groupRef = useRef<Konva.Group>(null);

        const pointerPos = transform ? getHandleCenter(transform) : undefined;

        const activeHandleId = transform?.handleId ?? 0;
        const handleProps: HandleFuncProps = { pointerPos, activeHandleId, modifierKeys: transform?.modifierKeys };

        const state = config.stateFunc(scene, object, handleProps, props);
        const handles = config.handleFunc(scene, object, handleProps, props, state);
        const rotation = config.getRotation?.(scene, object, handleProps, props) ?? 0;

        // https://github.com/reactwg/react-compiler/discussions/18
        const getPointerPos = useCallback(() => {
            if (!groupRef.current) {
                return { x: 0, y: 0 };
            }

            const { x, y } = groupRef.current.getRelativePointerPosition() ?? { x: 0, y: 0 };
            return { x, y: -y };
        }, []);

        const getTransformStart = (i: number) => {
            return (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
                e.evt.stopPropagation();

                const pointerPos = getPointerPos();
                const handleCornerOffset = e.target.getRelativePointerPosition() ?? { x: 0, y: 0 };

                // Offset is relative to rotated object, but we want the offset
                // in screen coordinates, so back out the rotation.
                const handleOffset = rotateCoord(
                    {
                        x: handleCornerOffset.x - e.target.offsetX(),
                        y: handleCornerOffset.y - e.target.offsetY(),
                    },
                    -rotation,
                );
                const handleFuncProps: HandleFuncProps = { modifierKeys: e.evt };

                const handleId = getHandleId(
                    config.handleFunc(
                        scene,
                        object,
                        handleFuncProps,
                        props,
                        config.stateFunc(scene, object, handleFuncProps, props),
                    ),
                    i,
                );

                onActive?.(true);
                setTransform({ pointerPos, handleOffset, handleId, modifierKeys: e.evt });
            };
        };

        useLayoutEffect(() => {
            if (!transform) {
                return;
            }

            const handleMove = (e: MouseEvent | TouchEvent) => {
                const pointerPos = getPointerPos();
                setTransform({ ...transform, pointerPos, modifierKeys: e });
            };

            const handleUpdatedModifier = (e: KeyboardEvent) => {
                setTransform({ ...transform, modifierKeys: e });
            };

            const handleEnd = (e: MouseEvent | TouchEvent) => {
                e.stopPropagation();

                onActive?.(false);
                setTransform(undefined);

                const pointerPos = getHandleCenter({ ...transform, pointerPos: getPointerPos() });

                const activeHandleId = transform?.handleId ?? 0;
                const handleProps: HandleFuncProps = { pointerPos, activeHandleId, modifierKeys: e };
                const state = config.stateFunc(scene, object, handleProps, props);
                onTransformEnd?.(state);
            };

            // As long as we are transforming, handle mouse and keyboard events on the whole screen.
            // Capture mouse up events so we can prevent other Konva nodes from handling
            // them and preventing the transform from ever ending.
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('keydown', handleUpdatedModifier);
            window.addEventListener('keyup', handleUpdatedModifier);
            window.addEventListener('mouseup', handleEnd, true);
            window.addEventListener('touchend', handleEnd, true);

            return () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('keydown', handleUpdatedModifier);
                window.removeEventListener('keyup', handleUpdatedModifier);
                window.removeEventListener('mouseup', handleEnd, true);
                window.removeEventListener('touchend', handleEnd, true);
            };
        }, [scene, transform, object, onActive, setTransform, onTransformEnd, getPointerPos, props]);

        const setCursor = (cursor: string) => {
            if (stage) {
                stage.container().style.cursor = cursor;
            }
        };

        const center = getCanvasCoord(scene, arena, object);

        // Make sure to render everything relative to any updated object position
        const offset = { x: 0, y: 0 };
        if (state.x !== undefined) {
            offset.x = object.x - state.x;
        }
        if (state.y !== undefined) {
            offset.y = object.y - state.y;
        }
        // (state and object position is not in canvas coordinates, which has the Y axis flipped)
        offset.y *= -1;

        return (
            <>
                <Group offset={offset}>{children(state)}</Group>
                <ControlsPortal>
                    {/* Rotating this group would affect the pointer position, so rotate an inner group instead. */}
                    <Group ref={groupRef} x={center.x} y={center.y} visible={visible}>
                        {/* The offset from the active transformation should happen before the rotation,
                            and also not be part of the outer group's settings to keep the pointer stable. */}
                        <Group offset={offset}>
                            <Group rotation={rotation}>
                                <Group listening={false}>{config.onRenderBorder?.(object, state, props)}</Group>

                                {handles.map((handle, i) => (
                                    <HandleComponent
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
                    </Group>
                </ControlsPortal>
            </>
        );
    };

    return ControlPointManager;
}
