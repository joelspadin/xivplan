import { ThemeContext, useTheme } from '@fluentui/react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject, useCallback, useContext, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { getDropAction, usePanelDrag } from '../PanelDragProvider';
import { SceneContext, useScene } from '../SceneProvider';
import { SelectionContext, selectNone, selectSingle, useSelection } from '../SelectionProvider';
import { ArenaRenderer } from './ArenaRenderer';
import { getCanvasSize, getSceneCoord } from './coord';
import { LayerName } from './layers';
import { ObjectRenderer } from './ObjectRenderer';
import { StageContext } from './StageProvider';

export const SceneRenderer: React.FunctionComponent = () => {
    const theme = useTheme();
    const sceneBridge = useContext(SceneContext);
    const selectionBridge = useContext(SelectionContext);
    const [scene] = useScene();
    const [, setSelection] = selectionBridge;
    const size = getCanvasSize(scene);
    const stageRef = useRef<Konva.Stage>(null);

    console.log(scene);

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
                            <SelectionContext.Provider value={selectionBridge}>
                                <Layer name={LayerName.Arena}>
                                    <ArenaRenderer />
                                    <ObjectRenderer objects={scene.objects} layer={LayerName.Arena} />
                                </Layer>
                                <Layer name={LayerName.Ground}>
                                    <ObjectRenderer objects={scene.objects} layer={LayerName.Ground} />
                                </Layer>
                                <Layer name={LayerName.Default}>
                                    <ObjectRenderer objects={scene.objects} layer={LayerName.Default} />
                                </Layer>
                                <Layer name={LayerName.Tether}>
                                    <ObjectRenderer objects={scene.objects} layer={LayerName.Tether} />
                                </Layer>
                                <Layer listening={false} name={LayerName.Active} />
                            </SelectionContext.Provider>
                        </SceneContext.Provider>
                    </ThemeContext.Provider>
                </StageContext.Provider>
            </Stage>
        </DropTarget>
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
                setSelection(selectSingle(scene.objects.length));
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
