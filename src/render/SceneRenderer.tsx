import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren, RefObject, useCallback, useContext, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { DefaultCursorProvider } from '../DefaultCursorState';
import { getDropAction } from '../DropHandler';
import { DrawConfigContext, EditModeContext, TetherConfigContext } from '../EditModeProvider';
import { SceneHotkeyHandler } from '../HotkeyHandler';
import { EditorState, SceneAction, SceneContext, useCurrentStep, useScene } from '../SceneProvider';
import { SelectionContext } from '../SelectionProvider';
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
    const sceneBridge = useContext(SceneContext);
    const selectionBridge = useContext(SelectionContext);
    const editModeBridge = useContext(EditModeContext);
    const drawConfigBridge = useContext(DrawConfigContext);
    const tetherConfigBridge = useContext(TetherConfigContext);

    const { scene } = useScene();
    const [, setSelection] = selectionBridge;
    const size = getCanvasSize(scene);
    const stageRef = useRef<Konva.Stage>(null);

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
        <DropTarget stageRef={stageRef}>
            <Stage {...size} ref={stageRef} onClick={onClickStage}>
                <StageContext.Provider value={stageRef.current}>
                    <DefaultCursorProvider>
                        <SceneContext.Provider value={sceneBridge}>
                            <EditModeContext.Provider value={editModeBridge}>
                                <DrawConfigContext.Provider value={drawConfigBridge}>
                                    <TetherConfigContext.Provider value={tetherConfigBridge}>
                                        <SelectionContext.Provider value={selectionBridge}>
                                            <SceneContents />
                                        </SelectionContext.Provider>
                                    </TetherConfigContext.Provider>
                                </DrawConfigContext.Provider>
                            </EditModeContext.Provider>
                        </SceneContext.Provider>
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
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({ scene, stepIndex, width, height }) => {
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

    return (
        <Stage x={x} y={y} width={width} height={height} scaleX={scale} scaleY={scale}>
            <DefaultCursorProvider>
                <SceneContext.Provider value={sceneContext}>
                    <SceneContents />
                </SceneContext.Provider>
            </DefaultCursorProvider>
        </Stage>
    );
};

const SceneContents: React.FC = () => {
    const step = useCurrentStep();

    return (
        <>
            <SceneHotkeyHandler />

            <Layer name={LayerName.Ground}>
                <ArenaRenderer />
                <ObjectRenderer objects={step.objects} layer={LayerName.Ground} />
            </Layer>
            <Layer name={LayerName.Default}>
                <ObjectRenderer objects={step.objects} layer={LayerName.Default} />
            </Layer>
            <Layer name={LayerName.Foreground}>
                <ObjectRenderer objects={step.objects} layer={LayerName.Foreground} />

                <TetherEditRenderer />
            </Layer>
            <Layer name={LayerName.Active}>
                <DrawTarget />
            </Layer>
            <Layer name={LayerName.Controls} />
        </>
    );
};

interface DropTargetProps extends PropsWithChildren {
    stageRef: RefObject<Konva.Stage>;
}

const DropTarget: React.FC<DropTargetProps> = ({ stageRef, children }) => {
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [dragObject, setDragObject] = usePanelDrag();

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();

            if (!dragObject || !stageRef.current) {
                return;
            }

            setDragObject(null);
            stageRef.current.setPointersPositions(e);

            const position = stageRef.current.getPointerPosition();
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
        [scene, stageRef, dispatch, setSelection, dragObject, setDragObject],
    );

    return (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
            {children}
        </div>
    );
};
