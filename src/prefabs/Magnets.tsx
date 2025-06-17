import { CircleConfig } from 'konva/lib/shapes/Circle';
import React from 'react';
import { Circle, Group, Rect, Shape } from 'react-konva';
import { COLOR_ORANGE } from '../render/sceneTheme';

const PLUS_GRADIENT = [0.25, COLOR_ORANGE, 1, '#430900'];
const PLUS_FILL = '#ffffff';
const PLUS_STROKE = '#430900';

export const MagnetPlus: React.FC<CircleConfig> = ({ x, y, radius, listening, ...props }) => {
    const r = radius ?? 0;
    const size = r * 1.5;
    const thickness = r * 0.35;
    const strokeWidth = Math.max(1, r / 20);

    return (
        <Group x={x} y={y} listening={listening}>
            <Circle
                {...props}
                radius={radius}
                fillRadialGradientColorStops={PLUS_GRADIENT}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndRadius={radius}
            />
            <Shape
                fill={PLUS_FILL}
                stroke={PLUS_STROKE}
                strokeWidth={strokeWidth}
                sceneFunc={(context, shape) => {
                    const s_2 = size / 2;
                    const t_2 = thickness / 2;

                    context.beginPath();
                    context.moveTo(s_2, -t_2);
                    context.lineTo(s_2, t_2);
                    context.lineTo(t_2, t_2);
                    context.lineTo(t_2, s_2);
                    context.lineTo(-t_2, s_2);
                    context.lineTo(-t_2, t_2);
                    context.lineTo(-s_2, t_2);
                    context.lineTo(-s_2, -t_2);
                    context.lineTo(-t_2, -t_2);
                    context.lineTo(-t_2, -s_2);
                    context.lineTo(t_2, -s_2);
                    context.lineTo(t_2, -t_2);
                    context.closePath();
                    context.fillStrokeShape(shape);
                }}
            />
        </Group>
    );
};

const MINUS_GRADIENT = [0.15, '#007BF7', 0.9, '#003390', 1, '#00348E'];
const MINUS_FILL = '#ffffff';
const MINUS_STROKE = '#003390';

export const MagnetMinus: React.FC<CircleConfig> = ({ x, y, radius, listening, ...props }) => {
    const r = radius ?? 0;
    const width = r * 1.5;
    const height = r * 0.35;
    const strokeWidth = Math.max(1, r / 20);

    return (
        <Group x={x} y={y} listening={listening}>
            <Circle
                {...props}
                radius={radius}
                fillRadialGradientColorStops={MINUS_GRADIENT}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndRadius={radius}
            />
            <Rect
                width={width}
                height={height}
                offsetX={width / 2}
                offsetY={height / 2}
                fill={MINUS_FILL}
                stroke={MINUS_STROKE}
                strokeWidth={strokeWidth}
            />
        </Group>
    );
};
