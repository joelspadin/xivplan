import { ThemeContext, useTheme } from '@fluentui/react';
import Konva from 'konva';
import React, { RefObject, useContext, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { getDropAction, usePanelDrag } from '../PanelDragProvider';
import { Scene } from '../scene';
import { SceneAction, SceneContext, useScene } from '../SceneProvider';
import { SceneSelection, useSelection } from '../SelectionProvider';
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
                        <Layer listening={false} name="background">
                            <ArenaRenderer />
                        </Layer>
                        <Layer>
                            <ObjectRenderer objects={scene.zones} />
                            <ObjectRenderer objects={scene.markers} />
                            <ObjectRenderer objects={scene.actors} />
                            <ObjectRenderer objects={scene.tethers} />
                        </Layer>
                    </SceneContext.Provider>
                </ThemeContext.Provider>
            </Stage>
        </DropTarget>
    );
};

interface DropTargetProps {
    stageRef: RefObject<Konva.Stage>;
}

function getNewSelection(scene: Scene, action: SceneAction): SceneSelection | undefined {
    switch (action.type) {
        case 'actors':
            if (action.op === 'add') {
                return { layer: 'actors', index: scene.actors.length };
            }
            break;

        case 'markers':
            if (action.op === 'add') {
                return { layer: 'markers', index: scene.markers.length };
            }
            break;

        case 'tethers':
            if (action.op === 'add') {
                return { layer: 'tethers', index: scene.tethers.length };
            }
            break;

        case 'zones':
            if (action.op === 'add') {
                return { layer: 'zones', index: scene.zones.length };
            }
            break;
    }

    return undefined;
}

const DropTarget: React.FunctionComponent<DropTargetProps> = ({ stageRef, children }) => {
    const [scene, dispatch] = useScene();
    const [, setSelection] = useSelection();
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
                    setSelection(getNewSelection(scene, action));
                }
            }}
            onDragOver={(e) => e.preventDefault()}
        >
            {children}
        </div>
    );
};
