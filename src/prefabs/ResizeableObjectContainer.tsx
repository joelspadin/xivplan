import React from 'react';
import type { ResizeableObject, UnknownObject } from '../scene';
import { Resizer, type ResizerControlPointProps, type ResizerProps } from './Resizer';

/**
 * Properties to apply to the enclosing Group of resizeable objects, and to use in drawing an
 * accurate preview during transformations.
 */
export interface ResizeableGroupState {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly width: number;
    readonly height: number;
    readonly rotation: number;
    readonly isDragging?: boolean;
    readonly isResizing?: boolean;
}

export interface ResizeableObjectContainerProps {
    object: ResizeableObject & UnknownObject;
    resizerProps?: Partial<ResizerProps>;
    transformationProps?: Partial<ResizerControlPointProps>;
    children: (state: ResizeableGroupState) => React.ReactElement;
}

export const ResizeableObjectContainer: React.FC<ResizeableObjectContainerProps> = ({
    object,
    resizerProps,
    transformationProps,
    children,
}) => {
    return (
        <Resizer object={object} {...resizerProps} transformationProps={transformationProps}>
            {(objectState) => {
                return children({
                    offsetX: objectState.width / 2,
                    offsetY: objectState.height / 2,
                    rotation: objectState.rotation,
                    width: objectState.width,
                    height: objectState.height,
                    isDragging: objectState.isDragging,
                    isResizing: objectState.isResizing,
                });
            }}
        </Resizer>
    );
};
