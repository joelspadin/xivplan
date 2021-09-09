import { Context as KonvaContext } from 'konva/lib/Context';
import React from 'react';
import { Ellipse, Group, Image, Layer, Rect, Shape } from 'react-konva';
import useImage from 'use-image';
import { ArenaShape, CustomGrid, GridType, RadialGrid, RectangularGrid, Scene } from '../scene';
import { useScene } from '../SceneProvider';
import {
    ALIGN_TO_PIXEL,
    getCanvasArenaEllipse,
    getCanvasArenaRect,
    getCanvasCoord,
    getCanvasX,
    getCanvasY,
    useCanvasArenaEllipse,
    useCanvasArenaRect,
} from './coord';
import { useSceneTheme } from './SceneTheme';

export const ArenaRenderer: React.FunctionComponent = () => {
    return (
        <>
            <Layer listening={false}>
                <BackgroundRenderer />
                <ArenaClip>
                    <BackgroundImage />
                    <GridRenderer />
                </ArenaClip>
            </Layer>
        </>
    );
};

function getArenaClip(scene: Scene): (context: KonvaContext) => void {
    const rect = getCanvasArenaRect(scene);
    const center = getCanvasCoord(scene, { x: 0, y: 0 });

    switch (scene.arena.shape) {
        case ArenaShape.Circle:
            return (ctx) => {
                ctx.beginPath();
                ctx.ellipse(center.x, center.y, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
                ctx.clip();
                ctx.closePath();
            };

        case ArenaShape.Rectangle:
            return (ctx) => {
                ctx.beginPath();
                ctx.rect(rect.x, rect.y, rect.width, rect.height);
                ctx.clip();
                ctx.closePath();
            };
    }
}

const ArenaClip: React.FunctionComponent = ({ children }) => {
    const [scene] = useScene();
    const clip = getArenaClip(scene);

    return <Group clipFunc={clip}>{children}</Group>;
};

const BackgroundImage: React.FunctionComponent = () => {
    const [scene] = useScene();
    const [image] = useImage(scene.arena.backgroundImage ?? '');

    if (!image) {
        return null;
    }

    const position = getCanvasArenaRect(scene);

    return <Image image={image} {...position} />;
};

const BackgroundRenderer: React.FunctionComponent = () => {
    const [scene] = useScene();

    switch (scene.arena.shape) {
        case ArenaShape.Circle:
            return <CircularBackground />;

        case ArenaShape.Rectangle:
            return <RectangularBackground />;
    }
};

const CircularBackground: React.FunctionComponent = () => {
    const position = useCanvasArenaEllipse();
    const theme = useSceneTheme();

    return <Ellipse {...position} {...theme.arena} {...ALIGN_TO_PIXEL} />;
};

const RectangularBackground: React.FunctionComponent = () => {
    const position = useCanvasArenaRect();
    const theme = useSceneTheme();

    return <Rect {...position} {...theme.arena} {...ALIGN_TO_PIXEL} />;
};

const GridRenderer: React.FunctionComponent = () => {
    const [scene] = useScene();

    switch (scene.arena.grid.type) {
        case GridType.None:
            return null;

        case GridType.Radial:
            return <RadialGridRenderer grid={scene.arena.grid} />;

        case GridType.Rectangular:
            return <RectangularGridRenderer grid={scene.arena.grid} />;

        case GridType.Custom:
            return <CustomGridRenderer grid={scene.arena.grid} />;
    }
};

interface GridProps<T> {
    grid: T;
}

function modPositive(x: number, y: number) {
    return ((x % y) + y) % y;
}

function getRingGridDivs(divs: number, radiusX: number, radiusY: number) {
    return Array.from({ length: divs - 1 }, (_, i) => ({
        radiusX: ((i + 1) / divs) * radiusX,
        radiusY: ((i + 1) / divs) * radiusY,
    }));
}

function circlePointAtAngle(t: number, radiusX: number, radiusY: number) {
    t = modPositive(t - Math.PI / 2, Math.PI * 2);

    const r = Math.sqrt(radiusX * radiusX + radiusY * radiusY);
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);

    return { x, y };
}

function degToRad(angle: number) {
    return (angle * Math.PI) / 180;
}

function getSpokeGridDivs(divs: number, startAngle: number | undefined, radiusX: number, radiusY: number) {
    if (divs <= 1) {
        return [];
    }

    const startRad = degToRad(startAngle ?? 0);

    return Array.from({ length: divs }, (_, i) =>
        circlePointAtAngle(startRad + (i / divs) * Math.PI * 2, radiusX, radiusY),
    );
}

const RadialGridRenderer: React.FunctionComponent<GridProps<RadialGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const [scene] = useScene();
    const clip = getArenaClip(scene);
    const position = getCanvasArenaEllipse(scene);

    const rings = getRingGridDivs(grid.radialDivs, position.radiusX, position.radiusY);
    const spokes = getSpokeGridDivs(grid.angularDivs, grid.startAngle, position.radiusX, position.radiusY);

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                clip(ctx);

                ctx.beginPath();

                for (const spoke of spokes) {
                    ctx.moveTo(position.x, position.y);
                    ctx.lineTo(position.x + spoke.x, position.y + spoke.y);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);

                ctx.beginPath();

                for (const ring of rings) {
                    ctx.ellipse(position.x, position.y, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};

function getLinearGridDivs(divs: number, start: number, distance: number) {
    return Array.from({ length: divs - 1 }, (_, i) => start + ((i + 1) / divs) * distance);
}

const RectangularGridRenderer: React.FunctionComponent<GridProps<RectangularGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const [scene] = useScene();

    const position = getCanvasArenaRect(scene);

    const rows = getLinearGridDivs(grid.rows, position.y, position.height);
    const cols = getLinearGridDivs(grid.columns, position.x, position.width);

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                for (const x of cols) {
                    ctx.moveTo(x, position.y);
                    ctx.lineTo(x, position.y + position.height);
                }

                for (const y of rows) {
                    ctx.moveTo(position.x, y);
                    ctx.lineTo(position.x + position.width, y);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};

const CustomGridRenderer: React.FunctionComponent<GridProps<CustomGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const [scene] = useScene();
    const clip = getArenaClip(scene);
    const position = getCanvasArenaRect(scene);

    return (
        <Shape
            sceneFunc={(context, shape) => {
                clip(context);

                context.beginPath();

                for (const column of grid.columns) {
                    const x = getCanvasX(scene, column);
                    context.moveTo(x, position.y);
                    context.lineTo(x, position.y + position.height);
                }

                for (const row of grid.rows) {
                    const y = getCanvasY(scene, row);
                    context.moveTo(position.x, y);
                    context.lineTo(position.x + position.width, y);
                }

                context.closePath();
                context.fillStrokeShape(shape);
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};
