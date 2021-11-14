import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Line, Rect } from 'react-konva';
import simplify from 'simplify-js';
import { getCanvasCoord, getSceneCoord } from '../coord';
import { DrawConfig, EditMode, useDrawConfig, useEditMode } from '../EditModeProvider';
import { DRAW_LINE_PROPS } from '../prefabs/DrawObjectRenderer';
import { DrawObject, ObjectType, Scene } from '../scene';
import { useScene } from '../SceneProvider';
import { selectNewObjects, selectNone, useSelection } from '../SelectionProvider';
import { useStage } from './StageProvider';

const SIMPLIFY_THRESHOLD = 0.5;
const SIMPLIFY_HIGH_QUALITY = true;

export const DrawTarget: React.FC = () => {
    const [editMode] = useEditMode();
    return editMode === EditMode.Draw ? <DrawTargetLayer /> : null;
};

function getPointerPosition(scene: Scene, e: KonvaEventObject<MouseEvent>) {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) {
        return null;
    }
    return getSceneCoord(scene, pos);
}

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

    const relativePoints = simplified.map((pos) => {
        return {
            x: width === 0 ? 0 : (pos.x - x) / width,
            y: height === 0 ? 0 : (pos.y - y) / height,
        };
    });

    return { type: ObjectType.Draw, points: relativePoints, x, y, width, height, rotation: 0, ...config };
}

const DrawTargetLayer: React.FC = () => {
    const [points, setPoints] = useState<Vector2d[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [config] = useDrawConfig();
    const [scene, dispatch] = useScene();
    const [, setSelection] = useSelection();
    const stage = useStage();

    useEffect(() => {
        if (stage) {
            stage.container().style.cursor = 'crosshair';
            return () => {
                stage.container().style.cursor = 'default';
            };
        }
    }, [stage]);

    const onMouseDown = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            setSelection(selectNone());

            const pos = getPointerPosition(scene, e);
            if (pos) {
                setIsDrawing(true);
                setPoints([pos]);
            }
        },
        [scene, setSelection, setIsDrawing, setPoints],
    );

    const onMouseMove = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            if (!isDrawing) {
                return;
            }

            const pos = getPointerPosition(scene, e);
            if (pos) {
                setPoints([...points, pos]);
            }
        },
        [scene, isDrawing, points, setPoints],
    );

    const onMouseUp = useCallback(() => {
        if (!isDrawing) {
            return;
        }

        setIsDrawing(false);

        const object = getDrawObject(points, config);
        if (object.points.length > 1) {
            dispatch({ type: 'add', object });
            setSelection(selectNewObjects(scene, 1));
        }
    }, [config, scene, dispatch, setSelection, isDrawing, setIsDrawing, points]);

    const linePoints = useMemo(() => convertPoints(scene, points), [scene, points]);

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
