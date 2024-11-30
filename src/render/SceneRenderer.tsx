import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren, useCallback, useContext, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { DefaultCursorProvider } from '../DefaultCursorProvider';
import { getDropAction } from '../DropHandler';
import { SceneHotkeyHandler } from '../HotkeyHandler';
import { EditorState, SceneAction, SceneContext, useCurrentStep, useScene } from '../SceneProvider';
import { SelectionContext, SelectionState } from '../SelectionContext';
import { getCanvasSize, getSceneCoord } from '../coord';
import { Scene } from '../scene';
import { selectNewObjects, selectNone, useSelection } from '../selection';
import { UndoContext } from '../undo/undoContext';
import { usePanelDrag } from '../usePanelDrag';
import { ArenaRenderer } from './ArenaRenderer';
import { DrawTarget } from './DrawTarget';
import { ObjectRenderer } from './ObjectRenderer';
import { StageContext } from './StageContext';
import { TetherEditRenderer } from './TetherEditRenderer';
import { LayerName } from './layers';

export const SceneRenderer: React.FC = () => {
    const { scene } = useScene();
    const [, setSelection] = useContext(SelectionContext);
    const size = getCanvasSize(scene);
    const [stage, stageRef] = useState<Konva.Stage | null>(null);

    const onClickStage = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            // Clicking on nothing (with no modifier keys held) should cancel selection.
            if (!e.evt.ctrlKey && !e.evt.shiftKey) {
                setSelection(selectNone());
            }
        },
        [setSelection],
    );

    // console.log(scene);

    return (
        <DropTarget stage={stage}>
            <Stage {...size} ref={stageRef} onClick={onClickStage}>
                <StageContext.Provider value={stage}>
                    <DefaultCursorProvider>
                        <SceneContents />
                    </DefaultCursorProvider>
                </StageContext.Provider>
            </Stage>
        </DropTarget>
    );
};

export interface ScenePreviewProps {
    scene: Scene;
    stepIndex?: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
}

export const ScenePreview = React.forwardRef<Konva.Stage, ScenePreviewProps>(
    ({ scene, stepIndex, width, height, backgroundColor }, ref) => {
        const size = getCanvasSize(scene);
        let scale = 1;
        let x = 0;
        let y = 0;

        if (width) {
            scale = Math.min(scale, width / size.width);
        }
        if (height) {
            scale = Math.min(scale, height / size.height);
        }

        size.width *= scale;
        size.height *= scale;

        if (width) {
            x = (width - size.width) / 2;
        }
        if (height) {
            y = (height - size.height) / 2;
        }

        const sceneContext: UndoContext<EditorState, SceneAction> = [
            {
                present: {
                    scene,
                    currentStep: stepIndex ?? 0,
                },
                past: [],
                future: [],
            },
            () => undefined,
        ];

        const selectionContext: SelectionState = [new Set<number>(), () => {}];

        return (
            <Stage ref={ref} x={x} y={y} width={width} height={height} scaleX={scale} scaleY={scale}>
                <DefaultCursorProvider>
                    <SceneContext.Provider value={sceneContext}>
                        <SelectionContext.Provider value={selectionContext}>
                            <SceneContents listening={false} preview={true} backgroundColor={backgroundColor} />
                        </SelectionContext.Provider>
                    </SceneContext.Provider>
                </DefaultCursorProvider>
            </Stage>
        );
    },
);
ScenePreview.displayName = 'ScenePreview';

interface SceneContentsProps {
    listening?: boolean;
    preview?: boolean;
    backgroundColor?: string;
}

const SceneContents: React.FC<SceneContentsProps> = ({ listening, preview, backgroundColor }) => {
    listening = listening ?? true;

    const step = useCurrentStep();

    return (
        <>
            {listening && <SceneHotkeyHandler />}

            <Layer name={LayerName.Ground} listening={listening}>
                <ArenaRenderer backgroundColor={backgroundColor} preview={preview} />
                <ObjectRenderer objects={step.objects} layer={LayerName.Ground} />
            </Layer>
            <Layer name={LayerName.Default} listening={listening}>
                <ObjectRenderer objects={step.objects} layer={LayerName.Default} />
            </Layer>
            <Layer name={LayerName.Foreground} listening={listening}>
                <ObjectRenderer objects={step.objects} layer={LayerName.Foreground} />

                <TetherEditRenderer />
            </Layer>
            <Layer name={LayerName.Active} listening={listening}>
                <DrawTarget />
            </Layer>
            <Layer name={LayerName.Controls} listening={listening} />
        </>
    );
};

interface DropTargetProps extends PropsWithChildren {
    stage: Konva.Stage | null;
}

const DropTarget: React.FC<DropTargetProps> = ({ stage, children }) => {
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [dragObject, setDragObject] = usePanelDrag();

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();

            if (!dragObject || !stage) {
                return;
            }

            setDragObject(null);
            stage.setPointersPositions(e);

            const position = stage.getPointerPosition();
            if (!position) {
                return;
            }

            position.x -= dragObject.offset.x;
            position.y -= dragObject.offset.y;

            const action = getDropAction(dragObject, getSceneCoord(scene, position));
            if (action) {
                dispatch(action);
                setSelection(selectNewObjects(scene, 1));
            }
        },
        [scene, stage, dispatch, setSelection, dragObject, setDragObject],
    );

    return (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
            {children}
        </div>
    );
};
