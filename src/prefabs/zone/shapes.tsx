import { ShapeConfig } from 'konva/lib/Shape';
import React from 'react';
import { Group, Line } from 'react-konva';
import { degtorad } from '../../util';

export interface ChevronConfig extends ShapeConfig {
    chevronAngle?: number;
}

export const Chevron: React.FC<ChevronConfig> = ({ width, height, chevronAngle, ...props }) => {
    const w = width ?? 0;
    const h = height ?? 0;
    const x = w / 2;
    const y = Math.sin(degtorad(chevronAngle ?? 45)) * x;

    // prettier-ignore
    const points = [
        0, 0,
        x, y,
        x, h,
        0, h - y,
        -x, h,
        -x, y,
    ];

    return <Line {...props} points={points} closed={true} />;
};

export const ChevronTail: React.FC<ChevronConfig> = (props) => {
    const { x, y, offsetX, offsetY, rotation, ...chevronProps } = props;
    const height = chevronProps.height ?? 0;
    const opacity = (chevronProps.opacity as number) ?? 1;

    return (
        <Group x={x} y={y} offsetX={offsetX} offsetY={offsetY} rotation={rotation}>
            <Chevron {...chevronProps} />
            <Chevron
                {...chevronProps}
                y={height * 0.5}
                height={height * 1.25}
                opacity={opacity * 0.3}
                strokeEnabled={false}
            />
        </Group>
    );
};
