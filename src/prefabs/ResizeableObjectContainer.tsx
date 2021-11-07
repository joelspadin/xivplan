import { useBoolean } from '@fluentui/react-hooks';
import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { KonvaNodeEvents } from 'react-konva';
import { ActivePortal } from '../render/Portals';
import { ResizeableObject, UnknownObject } from '../scene';
import { DraggableObject } from './DraggableObject';
import { Resizer, ResizerProps } from './Resizer';

export type GroupProps = Konva.NodeConfig & KonvaNodeEvents;

export interface ResizeableObjectContainerProps {
    object: ResizeableObject & UnknownObject;
    cache?: boolean;
    cacheKey?: unknown;
    resizerProps?: Partial<ResizerProps>;
    transformerProps?: Konva.TransformerConfig;
    children: (groupProps: GroupProps) => React.ReactElement;
}

export const ResizeableObjectContainer: React.VFC<ResizeableObjectContainerProps> = ({
    object,
    cache,
    cacheKey,
    resizerProps,
    transformerProps,
    children,
}) => {
    const [resizing, { setTrue: startResizing, setFalse: stopResizing }] = useBoolean(false);
    const [dragging, setDragging] = useState(false);
    const shapeRef = useRef<Konva.Group>(null);

    useEffect(() => {
        if (cache) {
            shapeRef.current?.cache();
        }
    }, [cache, cacheKey, shapeRef, object]);

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <Resizer
                    object={object}
                    nodeRef={shapeRef}
                    dragging={dragging}
                    transformerProps={transformerProps}
                    {...resizerProps}
                >
                    {(onTransformEnd) => {
                        return children({
                            ref: shapeRef,
                            onTransformStart: startResizing,
                            onTransformEnd: (e) => {
                                onTransformEnd(e);
                                stopResizing();
                            },
                            offsetX: object.width / 2,
                            offsetY: object.height / 2,
                            rotation: object.rotation,
                        });
                    }}
                </Resizer>
            </DraggableObject>
        </ActivePortal>
    );
};
