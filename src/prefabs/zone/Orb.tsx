import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useMemo } from 'react';
import { Circle } from 'react-konva';
import { getSphericalGradientStops } from './style';

export const Orb: React.FC<CircleConfig> = ({ fill, radius, ...props }) => {
    radius = radius ?? 0;

    const gradient = useMemo(() => (typeof fill === 'string' ? getSphericalGradientStops(fill) : undefined), [fill]);

    return (
        <Circle
            fillRadialGradientStartPoint={{ x: 0, y: -radius * 0.8 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={radius * 1.35}
            fillRadialGradientColorStops={gradient}
            radius={radius}
            {...props}
        />
    );
};
