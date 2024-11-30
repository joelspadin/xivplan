import React, { useMemo } from 'react';
import { Rect } from 'react-konva';
import { getCanvasArenaEllipse, getCanvasArenaRect } from '../coord';
import { RadialTicks, RectangularTicks, Scene, Ticks, TickType } from '../scene';
import { useScene } from '../SceneProvider';
import { degtorad, getLinearGridDivs } from '../util';
import { useSceneTheme } from './SceneTheme';

const MAJOR_TICK_SIZE = 7;
const MINOR_TICK_SIZE = 5;
const TICK_MARGIN = 2;

export const ArenaTickRenderer: React.FC = () => {
    const { scene } = useScene();

    if (!scene.arena.ticks) {
        return null;
    }

    switch (scene.arena.ticks.type) {
        case TickType.None:
            return null;

        case TickType.Rectangular:
            return <RectangularTickRenderer scene={scene} ticks={scene.arena.ticks} />;

        case TickType.Radial:
            return <RadialTickRenderer scene={scene} ticks={scene.arena.ticks} />;
    }
};

interface TickRendererProps<T extends Ticks> {
    scene: Scene;
    ticks: T;
}

const RectangularTickRenderer: React.FC<TickRendererProps<RectangularTicks>> = ({ scene, ticks }) => {
    const { majorProps, minorProps } = useMemo(() => {
        const rect = getCanvasArenaRect(scene);

        const minorProps = getRectangularTicks(ticks, rect, MINOR_TICK_SIZE);
        const majorProps = getCornerTicks(rect, MINOR_TICK_SIZE);

        return { majorProps, minorProps };
    }, [scene, ticks]);

    return (
        <>
            {minorProps.map((props, i) => (
                <MinorTick key={i} {...props} />
            ))}
            {majorProps.map((props, i) => (
                <MajorTick key={i} {...props} />
            ))}
        </>
    );
};

const RadialTickRenderer: React.FC<TickRendererProps<RadialTicks>> = ({ scene, ticks }) => {
    const { majorProps, minorProps } = useMemo(() => {
        const ellipse = getCanvasArenaEllipse(scene);

        const majorAngles = getRadialAngles(ticks.majorCount, ticks.majorStart);
        const minorAngles = getRadialAngles(ticks.minorCount, ticks.minorStart).filter(
            (a) => !includesAngle(majorAngles, a),
        );

        const majorProps = anglesToTicks(majorAngles, ellipse, MAJOR_TICK_SIZE);
        const minorProps = anglesToTicks(minorAngles, ellipse, MINOR_TICK_SIZE);

        return { majorProps, minorProps };
    }, [scene, ticks]);

    return (
        <>
            {minorProps.map((props, i) => (
                <MinorTick key={i} {...props} />
            ))}
            {majorProps.map((props, i) => (
                <MajorTick key={i} {...props} />
            ))}
        </>
    );
};

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Ellipse {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
}

interface TickProps {
    x: number;
    y: number;
    angle: number;
}

const MajorTick: React.FC<TickProps> = ({ x, y, angle }) => {
    const theme = useSceneTheme();

    return (
        <Rect
            x={x + 0.5}
            y={y + 0.5}
            offsetX={MAJOR_TICK_SIZE / 2}
            offsetY={MAJOR_TICK_SIZE / 2}
            width={MAJOR_TICK_SIZE}
            height={MAJOR_TICK_SIZE}
            rotationDeg={angle + 45}
            fill={theme.ticks.major}
        />
    );
};

const MinorTick: React.FC<TickProps> = ({ x, y, angle }) => {
    const theme = useSceneTheme();

    return (
        <Rect
            x={x + 0.5}
            y={y + 0.5}
            offsetX={MINOR_TICK_SIZE / 2}
            offsetY={MINOR_TICK_SIZE / 2}
            width={MINOR_TICK_SIZE}
            height={MINOR_TICK_SIZE}
            rotationDeg={angle + 45}
            fill={theme.ticks.minor}
        />
    );
};

function getRadialAngles(count: number, start: number): number[] {
    if (count <= 1) {
        return [];
    }

    return Array.from({ length: count }, (_, i) => start + (i / count) * 360);
}

function anglesToTicks(angles: number[], { x, y, radiusX, radiusY }: Ellipse, size: number): TickProps[] {
    radiusX += size + TICK_MARGIN;
    radiusY += size + TICK_MARGIN;

    return angles.map((angle) => {
        const angleRad = degtorad(angle - 90);
        return {
            angle,
            x: x + radiusX * Math.cos(angleRad),
            y: y + radiusY * Math.sin(angleRad),
        };
    });
}

const DELTA = 0.01;

function includesAngle(angles: number[], value: number) {
    return angles.some((a) => value >= a - DELTA && value <= a + DELTA);
}

function getCornerTicks({ x, y, width, height }: Rectangle, size: number): TickProps[] {
    const left = x - size - TICK_MARGIN;
    const right = x + width + size + TICK_MARGIN;
    const top = y - size - TICK_MARGIN;
    const bottom = y + height + size + TICK_MARGIN;

    return [
        {
            x: left,
            y: top,
            angle: 0,
        },
        {
            x: right,
            y: top,
            angle: 0,
        },
        {
            x: left,
            y: bottom,
            angle: 0,
        },
        {
            x: right,
            y: bottom,
            angle: 0,
        },
    ];
}

function getRectangularTicks(
    { columns, rows }: RectangularTicks,
    { x, y, width, height }: Rectangle,
    size: number,
): TickProps[] {
    const ticks: TickProps[] = [];

    for (const center of getLinearGridDivs(columns, x, width)) {
        const top = y - size - TICK_MARGIN;
        const bottom = y + height + size + TICK_MARGIN;

        ticks.push(
            {
                x: center,
                y: top,
                angle: 0,
            },
            {
                x: center,
                y: bottom,
                angle: 0,
            },
        );
    }

    for (const center of getLinearGridDivs(rows, y, height)) {
        const left = y - size - TICK_MARGIN;
        const right = y + width + size + TICK_MARGIN;

        ticks.push(
            {
                x: left,
                y: center,
                angle: 0,
            },
            {
                x: right,
                y: center,
                angle: 0,
            },
        );
    }

    return ticks;
}
