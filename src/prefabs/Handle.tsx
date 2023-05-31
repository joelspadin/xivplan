import Konva from 'konva';
import React from 'react';
import { KonvaNodeEvents, Rect } from 'react-konva';
import {
    CONTROL_POINT_OFFSET,
    CONTROL_POINT_SIZE,
    DIAMOND_FILL_COLOR,
    DIAMOND_STROKE_COLOR,
    HandleStyle,
    SQUARE_FILL_COLOR,
    SQUARE_STROKE_COLOR,
} from './ControlPoint';

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
export const Handle: React.FC<HandleProps> = ({ style, ...props }) => {
    switch (style) {
        case HandleStyle.Square:
            return <SquareHandle {...props} />;

        case HandleStyle.Diamond:
            return <DiamondHandle {...props} />;
    }
};
