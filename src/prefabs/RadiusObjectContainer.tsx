import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useState } from 'react';
import { Circle } from 'react-konva';
import { ActivePortal } from '../render/Portals';
import { RadiusObject, SceneObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { distance } from '../util';
import { MIN_RADIUS } from './bounds';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager } from './ControlPoint';
import { DraggableObject } from './DraggableObject';
import { useShowResizer } from './highlight';

export interface RadiusObjectContainerProps {
    object: RadiusObject & UnknownObject;
    index: number;
    children: (radius: number) => React.ReactElement;
    onTransformEnd?(radius: number): void;
}

export const RadiusObjectContainer: React.VFC<RadiusObjectContainerProps> = ({
    object,
    index,
    onTransformEnd,
    children,
}) => {
    const [, dispatch] = useScene();
    const showResizer = useShowResizer(object, index);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (radius: number) => {
            if (radius === object.radius) {
                return;
            }

            dispatch({ type: 'update', index, value: { ...object, radius } as SceneObject });
            onTransformEnd?.(radius);
        },
        [dispatch, onTransformEnd, object, index],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} index={index} onActive={setDragging}>
                <RadiusControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {children}
                </RadiusControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

const CURSORS = ['ew-resize', 'ew-resize', 'ns-resize', 'ns-resize'];
const OUTSET = 2;

function stateFunc(object: RadiusObject, controlPos?: Vector2d) {
    if (controlPos) {
        return Math.max(MIN_RADIUS, Math.round(distance(controlPos) - OUTSET));
    }

    return object.radius;
}

const RadiusControlPoints = createControlPointManager<RadiusObject, number>({
    positionFunc: (object, pointerPos) => {
        const r = stateFunc(object, pointerPos) + OUTSET;
        return [
            { x: r, y: 0 },
            { x: -r, y: 0 },
            { x: 0, y: -r },
            { x: 0, y: r },
        ];
    },
    cursorFunc: (index) => CURSORS[index] ?? 'default',
    stateFunc: stateFunc,
    transformStateFunc: stateFunc,
    onRenderBorder: (object, radius) => {
        return (
            <Circle radius={radius + OUTSET} stroke={CONTROL_POINT_BORDER_COLOR} strokeWidth={1} fillEnabled={false} />
        );
    },
});
