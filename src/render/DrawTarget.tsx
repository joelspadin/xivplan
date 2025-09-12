import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React, { useLayoutEffect, useState } from 'react';
import { Line, Rect } from 'react-konva';
import simplify from 'simplify-js';
import { DrawConfig } from '../EditModeContext';
import { useScene } from '../SceneProvider';
import { getCanvasCoord, getPointerPosition } from '../coord';
import { useDefaultCursor } from '../cursor';
import { EditMode } from '../editMode';
import { DRAW_LINE_PROPS } from '../prefabs/DrawObjectStyles';
import { DrawObject, ObjectType, Scene } from '../scene';
import { selectNewObjects, selectNone, useSelection } from '../selection';
import { useDrawConfig } from '../useDrawConfig';
import { useEditMode } from '../useEditMode';
import { useStage } from './stage';

const SIMPLIFY_THRESHOLD = 2.0;
const SIMPLIFY_HIGH_QUALITY = true;

export const DrawTarget: React.FC = () => {
    const [editMode] = useEditMode();
    return editMode === EditMode.Draw ? <DrawTargetLayer /> : null;
};

function convertPoints(scene: Scene, points: readonly Vector2d[]): number[] {
    const result: number[] = [];

    for (const scenePos of points) {
        const canvasPos = getCanvasCoord(scene, scenePos);
        result.push(canvasPos.x, canvasPos.y);
    }

    return result;
}

function getBoundingBox(points: Vector2d[]) {
    return {
        left: points.reduce((x, p) => Math.min(x, p.x), Infinity),
        right: points.reduce((x, p) => Math.max(x, p.x), -Infinity),
        bottom: points.reduce((x, p) => Math.min(x, p.y), Infinity),
        top: points.reduce((x, p) => Math.max(x, p.y), -Infinity),
    };
}

function getDrawObject(points: Vector2d[], config: DrawConfig): Omit<DrawObject, 'id'> {
    const simplified = simplify(points, SIMPLIFY_THRESHOLD, SIMPLIFY_HIGH_QUALITY);
    const bbox = getBoundingBox(simplified);

    const width = bbox.right - bbox.left;
    const height = bbox.top - bbox.bottom;
    const x = bbox.left + width / 2;
    const y = bbox.bottom + height / 2;

    const relativePoints: number[] = [];
    for (const point of simplified) {
        const px = width === 0 ? 0 : (point.x - x) / width;
        const py = height === 0 ? 0 : (point.y - y) / height;
        relativePoints.push(px, py);
    }

    return { type: ObjectType.Draw, points: relativePoints, x, y, width, height, rotation: 0, ...config };
}

const DrawTargetLayer: React.FC = () => {
    const [points, setPoints] = useState<Vector2d[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [config] = useDrawConfig();
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [, setDefaultCursor] = useDefaultCursor();
    const stage = useStage();

    useLayoutEffect(() => {
        if (stage) {
            setDefaultCursor('crosshair');
            stage.container().style.cursor = 'crosshair';

            return () => {
                setDefaultCursor('default');
                stage.container().style.cursor = 'default';
            };
        }
    }, [stage, setDefaultCursor]);

    const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        setSelection(selectNone());

        const pos = getPointerPosition(scene, e.target.getStage());
        if (pos) {
            setIsDrawing(true);
            setPoints([pos]);
        }
    };

    const onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing) {
            return;
        }

        const pos = getPointerPosition(scene, e.target.getStage());
        if (pos) {
            setPoints([...points, pos]);
        }
    };

    const onMouseUp = () => {
        if (!isDrawing) {
            return;
        }

        setIsDrawing(false);

        const object = getDrawObject(points, config);
        if (object.points.length > 2) {
            dispatch({ type: 'add', object });
            setSelection(selectNewObjects(scene, 1));
        }
    };

    const linePoints = convertPoints(scene, points);

    return (
        <>
            {isDrawing && (
                <Line
                    {...DRAW_LINE_PROPS}
                    points={linePoints}
                    stroke={config.color}
                    strokeWidth={config.brushSize}
                    opacity={config.opacity / 100}
                />
            )}
            <Rect
                width={stage?.width()}
                height={stage?.height()}
                fill="transparent"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onClick={(e) => (e.cancelBubble = true)}
            />
        </>
    );
};
