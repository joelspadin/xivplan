import { ThemeContext, useTheme } from '@fluentui/react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject, useCallback, useContext, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { getCanvasSize, getSceneCoord } from '../coord';
import { DrawConfigContext, EditModeContext } from '../EditModeProvider';
import { SceneHotkeyHandler } from '../HotkeyHandler';
import { getDropAction, usePanelDrag } from '../PanelDragProvider';
import { Scene } from '../scene';
import { SceneContext, useScene } from '../SceneProvider';
import { SelectionContext, selectNewObjects, selectNone, useSelection } from '../SelectionProvider';
import { ArenaRenderer } from './ArenaRenderer';
import { DrawTarget } from './DrawTarget';
import { LayerName } from './layers';
import { ObjectRenderer } from './ObjectRenderer';
import { StageContext } from './StageProvider';

export const SceneRenderer: React.FunctionComponent = () => {
    const theme = useTheme();
    const sceneBridge = useContext(SceneContext);
    const selectionBridge = useContext(SelectionContext);
    const editModeBridge = useContext(EditModeContext);
    const drawConfigBridge = useContext(DrawConfigContext);
    const [scene] = useScene();
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

    return (
        <DropTarget stageRef={stageRef}>
            <Stage {...size} ref={stageRef} onClick={onClickStage}>
                <StageContext.Provider value={stageRef.current}>
                    <ThemeContext.Provider value={theme}>
                        <SceneContext.Provider value={sceneBridge}>
                            <EditModeContext.Provider value={editModeBridge}>
                                <DrawConfigContext.Provider value={drawConfigBridge}>
                                    <SelectionContext.Provider value={selectionBridge}>
                                        <SceneContents scene={scene} />
                                    </SelectionContext.Provider>
                                </DrawConfigContext.Provider>
                            </EditModeContext.Provider>
                        </SceneContext.Provider>
                    </ThemeContext.Provider>
                </StageContext.Provider>
            </Stage>
        </DropTarget>
    );
};

interface SceneContentsProps {
    scene: Scene;
}

const SceneContents: React.FC<SceneContentsProps> = ({ scene }) => {
    return (
        <>
            <SceneHotkeyHandler />

            <Layer name={LayerName.Ground}>
                <ArenaRenderer />
                <ObjectRenderer objects={scene.objects} layer={LayerName.Ground} />
            </Layer>
            <Layer name={LayerName.Default}>
                <ObjectRenderer objects={scene.objects} layer={LayerName.Default} />
            </Layer>
            <Layer name={LayerName.Foreground}>
                <ObjectRenderer objects={scene.objects} layer={LayerName.Foreground} />
            </Layer>
            <Layer name={LayerName.Active}>
                <DrawTarget />
            </Layer>
            <Layer name={LayerName.Controls} />
        </>
    );
};

interface DropTargetProps {
    stageRef: RefObject<Konva.Stage>;
}

const DropTarget: React.FunctionComponent<DropTargetProps> = ({ stageRef, children }) => {
    const [scene, dispatch] = useScene();
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
        [scene, dispatch, setSelection, dragObject, setDragObject],
    );

    return (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
            {children}
        </div>
    );
};
