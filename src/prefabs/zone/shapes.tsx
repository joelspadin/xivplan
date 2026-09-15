import type { ShapeConfig } from 'konva/lib/Shape';
import type { ArcConfig } from 'konva/lib/shapes/Arc';
import React from 'react';
import { Group, Line, Shape } from 'react-konva';
import { degtorad } from '../../util';

export interface SingleChevronConfig extends ShapeConfig {
    /** The angle between the two chevron arms, in degrees. Defaults to 45. */
    chevronAngle?: number;
    /** The thickness of the chevron arms (measured as the length of the vertical edges) */
    thickness: number;
    // Height has no effect, so disallow setting it.
    height?: undefined;
}

export interface ChevronWithTailConfig extends SingleChevronConfig {
    /** The size of the gap between the main chevron and its tail. Defaults to 0. */
    tailGap?: number;
    /** Thickness of the chevron's tail. Defaults to `thickness * 1.5`. */
    tailThickness?: number;
    /** If true, two thinner chevrons will be rendered instead of just one thicker chevron. */
    doubleChevron?: boolean;
}

export const Chevron: React.FC<SingleChevronConfig> = ({ width, thickness, chevronAngle, ...props }) => {
    const w = width ?? 0;
    const x = w / 2;
    const y = Math.sin(degtorad(chevronAngle ?? 45)) * x;
    const h = y + thickness;

    // prettier-ignore
    const points = [
        0, 0,
        x, y,
        x, h,
        0, thickness,
        -x, h,
        -x, y,
    ];

    return <Line {...props} points={points} closed={true} />;
};

export const ChevronTail: React.FC<ChevronWithTailConfig> = (props) => {
    const { x, y, offsetX, offsetY, rotation, doubleChevron, ...chevronProps } = props;
    let thickness = chevronProps.thickness;
    const tailThickness = chevronProps.tailThickness ?? thickness * 1.5;
    const tailGap = chevronProps.tailGap ?? 0;
    const opacity = chevronProps.opacity ?? 1;

    if (doubleChevron) {
        // split the main chevron in two equal parts, but keep the tail as-is.
        thickness = thickness / 2;
    }
    const secondChevronOffset = doubleChevron ? thickness * 1.4 : 0;

    return (
        <Group x={x} y={y} offsetX={offsetX} offsetY={offsetY} rotation={rotation}>
            <Chevron {...chevronProps} thickness={thickness} />
            {doubleChevron && <Chevron {...chevronProps} y={secondChevronOffset} thickness={thickness} />}
            <Chevron
                {...chevronProps}
                y={secondChevronOffset + thickness + tailGap}
                thickness={tailThickness}
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
