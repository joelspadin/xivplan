import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Box } from 'konva/lib/shapes/Transformer';
import React, { type RefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Transformer } from 'react-konva';
import { useScene } from '../SceneProvider';
import { getBaseFacingRotation } from '../coord';
import { ControlsPortal } from '../render/Portals';
import type { ResizeableObject, SceneObject, UnknownObject } from '../scene';
import { clamp, clampRotation } from '../util';
import { type EventWithModifierKeys, shouldSnapAngle } from './ControlPoint';
import { useShowResizer } from './highlight';

const DEFAULT_MIN_SIZE = 20;

const SNAP_ANGLE = 15;
const ROTATION_SNAPS = Array.from({ length: 360 / SNAP_ANGLE }).map((_, i) => i * SNAP_ANGLE);

const MIN_ANCHOR_SIZE = 6;
const MAX_ANCHOR_SIZE = 10;

export interface ResizerProps {
    object: ResizeableObject & UnknownObject;
    nodeRef: RefObject<Konva.Group | null>;
    dragging?: boolean;
    minWidth?: number;
    minHeight?: number;
    transformerProps?: Konva.TransformerConfig;
    children: (onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void) => React.ReactElement;
}

interface TransformState {
    readonly modifierKeys?: EventWithModifierKeys;
}

export const Resizer: React.FC<ResizerProps> = ({
    object,
    nodeRef,
    dragging,
    minWidth,
    minHeight,
    transformerProps,
    children,
}) => {
    const { dispatch, scene } = useScene();
    const showResizer = useShowResizer(object);
    const trRef = useRef<Konva.Transformer>(null);
    const [transform, setTransform] = useState<TransformState>();

    const minWidthRequired = minWidth ?? DEFAULT_MIN_SIZE;
    const minHeightRequired = minHeight ?? DEFAULT_MIN_SIZE;

    const anchorSize = clamp((object.width + object.height) / 10, MIN_ANCHOR_SIZE, MAX_ANCHOR_SIZE);

    useLayoutEffect(() => {
        if (showResizer && trRef.current && nodeRef.current) {
            trRef.current.nodes([nodeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [object, showResizer, nodeRef, trRef]);

    // Manual memoization because React Compiler thinks handleTransformEnd being passed to
    // children() means it is used during render, and it uses a ref's .current property.
    const handleTransformEnd = useCallback(() => {
        setTransform(undefined);

        const node = nodeRef.current;
        if (!node) {
            return;
        }
        const baseRotation = getBaseFacingRotation(scene, object);

        const newProps = {
            x: Math.round(object.x + node.x()),
            y: Math.round(object.y - node.y()),
            rotation: clampRotation(node.rotation() - baseRotation),
            width: Math.round(Math.max(minWidthRequired, object.width * node.scaleX())),
            height: Math.round(Math.max(minHeightRequired, object.height * node.scaleY())),
        };

        node.scaleX(1);
        node.scaleY(1);
        node.x(0);
        node.y(0);
        node.clearCache();

        dispatch({ type: 'update', value: { ...object, ...newProps } as SceneObject });
    }, [dispatch, minHeightRequired, minWidthRequired, nodeRef, object, scene, setTransform]);

    const handleTransformStart = useCallback(
        (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            setTransform({ modifierKeys: e.evt });
        },
        [setTransform],
    );

    useLayoutEffect(() => {
        if (!transform) {
            return;
        }
        const handleUpdatedModifier = (e: KeyboardEvent) => {
            setTransform({ ...transform, modifierKeys: e });
        };

        // As long as we are transforming, look for key presses to support modifier keys.
        window.addEventListener('keydown', handleUpdatedModifier, true);
        window.addEventListener('keyup', handleUpdatedModifier, true);

        return () => {
            window.removeEventListener('keydown', handleUpdatedModifier, true);
            window.removeEventListener('keyup', handleUpdatedModifier, true);
        };
    }, [transform, setTransform]);

    const boundBoxFunc = useCallback(
        (oldBox: Box, newBox: Box) => {
            if (newBox.width < minWidthRequired || newBox.height < minHeightRequired) {
                return oldBox;
            }
            return newBox;
        },
        [minHeightRequired, minWidthRequired],
    );

    const baseRotation = useMemo(() => getBaseFacingRotation(scene, object), [scene, object]);
    const rotationSnaps = useMemo(
        () => (shouldSnapAngle(transform?.modifierKeys) ? ROTATION_SNAPS.map((r) => r + baseRotation) : []),
        [baseRotation, transform],
    );

    return (
        <>
            {
                // eslint-disable-next-line react-hooks/refs -- callback is only used in event handler
                children(handleTransformEnd)
            }
            {showResizer && (
                <ControlsPortal>
                    <Transformer
                        ref={trRef}
                        visible={!dragging}
                        rotationSnaps={rotationSnaps}
                        rotationSnapTolerance={2}
                        boundBoxFunc={boundBoxFunc}
                        anchorSize={anchorSize}
                        ignoreStroke
                        onTransformStart={handleTransformStart}
                        {...transformerProps}
                    />
                </ControlsPortal>
            )}
        </>
    );
};
