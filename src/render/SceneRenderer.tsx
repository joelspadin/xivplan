import { ThemeContext, useTheme } from '@fluentui/react';
import Konva from 'konva';
import React, { RefObject, useContext, useRef } from 'react';
import { Stage } from 'react-konva';
import { getDropAction, usePanelDrag } from '../PanelDragProvider';
import { SceneContext, useScene } from '../SceneProvider';
import { ArenaRenderer } from './ArenaRenderer';
import { getCanvasSize, getSceneCoord } from './coord';
import { ObjectRenderer } from './ObjectRenderer';

export const SceneRenderer: React.FunctionComponent = () => {
    const theme = useTheme();
    const sceneBridge = useContext(SceneContext);
    const [scene] = useScene();
    const size = getCanvasSize(scene);
    const stageRef = useRef<Konva.Stage>(null);

    console.log(scene);

    return (
        <DropTarget stageRef={stageRef}>
            <Stage {...size} ref={stageRef}>
                <ThemeContext.Provider value={theme}>
                    <SceneContext.Provider value={sceneBridge}>
                        <ArenaRenderer />
                        <ObjectRenderer objects={scene.zones} />
                        <ObjectRenderer objects={scene.markers} />
                        <ObjectRenderer objects={scene.actors} />
                        <ObjectRenderer objects={scene.tethers} />
                    </SceneContext.Provider>
                </ThemeContext.Provider>
            </Stage>
        </DropTarget>
    );
};

interface DropTargetProps {
    stageRef: RefObject<Konva.Stage>;
}

const DropTarget: React.FunctionComponent<DropTargetProps> = ({ stageRef, children }) => {
    const [scene, dispatch] = useScene();
    const [dragObject, setDragObject] = usePanelDrag();

    return (
        <div
            onDrop={(e) => {
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
                }
            }}
            onDragOver={(e) => e.preventDefault()}
        >
            {children}
        </div>
    );
};
