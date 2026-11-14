import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import React, { type PropsWithChildren, type RefAttributes, use, useState } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import { DefaultCursorProvider } from '../DefaultCursorProvider';
import { getDropAction } from '../DropHandler';
import { SceneHotkeyHandler } from '../HotkeyHandler';
import { type EditorState, type SceneAction, SceneContext, useCurrentStep, useScene } from '../SceneProvider';
import { SelectionContext, type SelectionState, SpotlightContext } from '../SelectionContext';
import { getCanvasSize, getSceneCoord } from '../coord';
import { EditMode } from '../editMode';
import type { Arena, Scene } from '../scene';
import { selectNewObjects, selectNone, useSelection } from '../selection';
import type { UndoContext } from '../undo/undoContext';
import { useEditMode } from '../useEditMode';
import { usePanelDrag } from '../usePanelDrag';
import { ArenaRenderer } from './ArenaRenderer';
import { DrawTarget } from './DrawTarget';
import { ObjectRenderer } from './ObjectRenderer';
import { StageContext } from './StageContext';
import { TetherEditRenderer } from './TetherEditRenderer';
import { LayerName } from './layers';

export const SceneRenderer: React.FC = () => {
    const { arena } = useScene();
    const [, setSelection] = use(SelectionContext);
    const size = getCanvasSize(arena);
    const [stage, setStage] = useState<Konva.Stage | null>(null);
    const [editMode] = useEditMode();

    const onClickStage = (e: KonvaEventObject<MouseEvent>) => {
        // Clicking on nothing while selecting a connection target should keep the
        // current selection to better keep the visuals of which objects are going to
        // get connected.
        if (editMode === EditMode.SelectConnection) {
            return;
        }
        // Clicking on nothing (with no modifier keys held) should cancel selection.
        if (!e.evt.ctrlKey && !e.evt.shiftKey) {
            setSelection(selectNone());
        }
    };

    // console.log(scene);

    return (
        <DropTarget stage={stage}>
            <Stage {...size} ref={setStage} onClick={onClickStage}>
                <StageContext value={stage}>
                    <DefaultCursorProvider>
                        <SceneContents />
                    </DefaultCursorProvider>
                </StageContext>
            </Stage>
        </DropTarget>
    );
};

export interface ScenePreviewProps extends RefAttributes<Konva.Stage> {
    scene: Scene;
    arena: Arena;
    stepIndex?: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    /** Do not draw complex objects that may slow down rendering. Useful for small previews. */
    simple?: boolean;
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({
    ref,
    scene,
    arena,
    stepIndex,
    width,
    height,
    backgroundColor,
    simple,
}) => {
    const size = getCanvasSize(arena);
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

    const present: EditorState = {
        scene,
        currentStep: stepIndex ?? 0,
    };

    const sceneContext: UndoContext<EditorState, SceneAction> = [
        {
            present,
            transientPresent: present,
            past: [],
            future: [],
        },
        () => undefined,
    ];

    const selectionContext: SelectionState = [new Set<number>(), () => {}];
    const spotlightContext: SelectionState = [new Set<number>(), () => {}];

    return (
        <Stage ref={ref} x={x} y={y} width={width} height={height} scaleX={scale} scaleY={scale}>
            <DefaultCursorProvider>
                <SceneContext value={sceneContext}>
                    <SelectionContext value={selectionContext}>
                        <SpotlightContext value={spotlightContext}>
                            <SceneContents listening={false} simple={simple} backgroundColor={backgroundColor} />
                        </SpotlightContext>
                    </SelectionContext>
                </SceneContext>
            </DefaultCursorProvider>
        </Stage>
    );
};

interface SceneContentsProps {
    listening?: boolean;
    simple?: boolean;
    backgroundColor?: string;
}

const SceneContents: React.FC<SceneContentsProps> = ({ listening, simple, backgroundColor }) => {
    listening = listening ?? true;

    const step = useCurrentStep();

    return (
        <>
            {listening && <SceneHotkeyHandler />}

            {/* The arena rarely changes, so it gets its own canvas. */}
            <Layer listening={listening}>
                <ArenaRenderer backgroundColor={backgroundColor} simple={simple} />
            </Layer>
            {/* The main canvas for objects. */}
            <Layer listening={listening}>
                <Group name={LayerName.Ground}>
                    <ObjectRenderer objects={step.objects} layer={LayerName.Ground} />
                </Group>
                <Group name={LayerName.Default}>
                    <ObjectRenderer objects={step.objects} layer={LayerName.Default} />
                </Group>
                <Group name={LayerName.Foreground}>
                    <ObjectRenderer objects={step.objects} layer={LayerName.Foreground} />
                </Group>
            </Layer>
            {/* Active objects and any other live updates get another layer to avoid redrawing
                everything else repeatedly. Things that need to always be on top also go here. */}
            <Layer listening={listening}>
                <TetherEditRenderer />
                <DrawTarget />
                <Group name={LayerName.Active} />
                <Group name={LayerName.Controls} />
            </Layer>
        </>
    );
};

interface DropTargetProps extends PropsWithChildren {
    stage: Konva.Stage | null;
}

const DropTarget: React.FC<DropTargetProps> = ({ stage, children }) => {
    const { scene, arena, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [dragObject, setDragObject] = usePanelDrag();

    const onDrop = (e: React.DragEvent) => {
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

        const action = getDropAction(dragObject, getSceneCoord(scene, arena, position));
        if (action) {
            dispatch(action);
            setSelection(selectNewObjects(scene, 1));
        }
    };

    return (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
            {children}
        </div>
    );
};
