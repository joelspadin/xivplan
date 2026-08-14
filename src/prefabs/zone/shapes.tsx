import type { ShapeConfig } from 'konva/lib/Shape';
import type { ArcConfig } from 'konva/lib/shapes/Arc';
import React from 'react';
import { Group, Line, Shape } from 'react-konva';
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

export interface OffsetArcProps extends ArcConfig {
    shapeOffset: number;
}

export const OffsetArc: React.FC<OffsetArcProps> = ({ innerRadius, outerRadius, angle, shapeOffset, ...props }) => {
    const angleRad = degtorad(angle);
    const offsetInnerRadius = innerRadius - shapeOffset;
    const offsetOuterRadius = outerRadius + shapeOffset;

    const innerArcX1 = offsetInnerRadius;
    const innerArcY1 = 0;
    const innerArcX2 = offsetInnerRadius * Math.cos(angleRad);
    const innerArcY2 = offsetInnerRadius * Math.sin(angleRad);

    const innerCornerX1 = innerArcX1;
    const innerCornerY1 = innerArcY1 - shapeOffset;
    const innerCornerX2 = innerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
    const innerCornerY2 = innerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

    const outerArcX1 = offsetOuterRadius;
    const outerArcY1 = 0;
    const outerArcX2 = offsetOuterRadius * Math.cos(angleRad);
    const outerArcY2 = offsetOuterRadius * Math.sin(angleRad);

    const outerCornerX1 = outerArcX1;
    const outerCornerY1 = outerArcY1 - shapeOffset;
    const outerCornerX2 = outerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
    const outerCornerY2 = outerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

    return (
        <Shape
            {...props}
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                ctx.arc(0, 0, offsetInnerRadius, 0, angleRad, false);
                ctx.lineTo(innerCornerX2, innerCornerY2);
                ctx.lineTo(outerCornerX2, outerCornerY2);
                ctx.arc(0, 0, offsetOuterRadius, angleRad, 0, true);
                ctx.lineTo(innerCornerX1, innerCornerY1);
                ctx.lineTo(outerCornerX1, outerCornerY1);

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
};
