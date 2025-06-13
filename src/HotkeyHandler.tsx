import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import { HelpContext } from './HelpContext';
import { HelpDialog } from './HelpDialog';
import { GroupMoveAction, SceneAction, getObjectById, useScene, useSceneUndoRedo } from './SceneProvider';
import { SceneSelection } from './SelectionContext';
import { getSceneCoord, rotateCoord } from './coord';
import { copyObjects, getGroupCenter } from './copy';
import { EditMode } from './editMode';
import { makeTethers } from './prefabs/TetherConfig';
import { useStage } from './render/stage';
import { MoveableObject, Scene, SceneObject, TetherType, isMoveable, isRotateable } from './scene';
import { getSelectedObjects, selectAll, selectNewObjects, selectNone, useSelection } from './selection';
import { useEditMode } from './useEditMode';
import { useHotkeyHelp, useHotkeys } from './useHotkeys';
import { useTetherConfig } from './useTetherConfig';

const CATEGORY_GENERAL = '1.General';
const CATEGORY_HISTORY = '2.History';
const CATEGORY_SELECTION = '3.Selection';
const CATEGORY_EDIT = '4.Edit';
const CATEGORY_TETHER = '5.Tether';
const CATEGORY_DRAW = '6.Draw';
const CATEGORY_STEPS = '7.Steps';

const UndoRedoHandler: React.FC = () => {
    const [undo, redo] = useSceneUndoRedo();

    useHotkeys('ctrl+z', CATEGORY_HISTORY, 'Undo', (e) => {
        undo();
        e.preventDefault();
    });
    useHotkeys('ctrl+y', CATEGORY_HISTORY, 'Redo', (e) => {
        redo();
        e.preventDefault();
    });

    return null;
};

function pasteObjects(
    stage: Stage,
    scene: Scene,
    dispatch: Dispatch<SceneAction>,
    setSelection: Dispatch<SetStateAction<SceneSelection>>,
    objects: readonly SceneObject[],
    centerOnMouse = true,
): void {
    const pointerPosition = stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
    const newCenter = centerOnMouse ? getSceneCoord(scene, pointerPosition) : undefined;
    const newObjects = copyObjects(scene, objects, newCenter);

    if (newObjects.length) {
        dispatch({ type: 'add', object: newObjects });
        setSelection(selectNewObjects(scene, newObjects.length));
    }
}

const SelectionActionHandler: React.FC = () => {
    const [clipboard, setClipboard] = useState<readonly SceneObject[]>([]);
    const [selection, setSelection] = useSelection();
    const [editMode, setEditMode] = useEditMode();
    const [tetherConfig, setTetherConfig] = useTetherConfig();
    const { scene, step, dispatch } = useScene();
    const stage = useStage();

    useHotkeys(
        'ctrl+a',
        CATEGORY_SELECTION,
        'Select all objects',
        (e) => {
            if (editMode !== EditMode.Normal) {
                return;
            }
            setSelection(selectAll(step.objects));
            e.preventDefault();
        },
        [setSelection, step.objects, editMode],
    );

    useHotkeys(
        'escape',
        CATEGORY_SELECTION,
        'Unselect all, cancel tool',
        (e) => {
            if (selection.size) {
                setSelection(selectNone());
            } else if (editMode !== EditMode.Normal) {
                setEditMode(EditMode.Normal);
            }

            e.preventDefault();
        },
        [selection, setSelection, editMode, setEditMode],
    );

    useHotkeys(
        'delete',
        CATEGORY_SELECTION,
        'Delete selected objects',
        (e) => {
            if (!selection.size || editMode !== EditMode.Normal) {
                return;
            }
            dispatch({ type: 'remove', ids: [...selection] });
            setSelection(selectNone());
            e.preventDefault();
        },
        [selection, setSelection, dispatch, editMode],
    );

    useHotkeys(
        'ctrl+c',
        CATEGORY_SELECTION,
        'Copy selected objects',
        (e) => {
            if (!selection.size || editMode !== EditMode.Normal) {
                return;
            }
            setClipboard(getSelectedObjects(step, selection));
            e.preventDefault();
        },
        [step, selection, editMode],
    );
    useHotkeys(
        'ctrl+x',
        CATEGORY_SELECTION,
        'Cut selected objects',
        (e) => {
            if (!selection.size || editMode !== EditMode.Normal) {
                return;
            }
            setClipboard(getSelectedObjects(step, selection));

            dispatch({ type: 'remove', ids: [...selection] });
            setSelection(selectNone());

            e.preventDefault();
        },
        [step, dispatch, setSelection, selection, editMode],
    );
    useHotkeys(
        'ctrl+v',
        CATEGORY_SELECTION,
        'Paste objects at mouse',
        (e) => {
            if (!clipboard.length || !stage || editMode !== EditMode.Normal) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, clipboard);
            e.preventDefault();
        },
        [stage, scene, dispatch, setSelection, clipboard, editMode],
    );

    useHotkeys(
        'ctrl+shift+v',
        CATEGORY_SELECTION,
        'Paste objects at original location',
        (e) => {
            if (!clipboard.length || !stage || editMode !== EditMode.Normal) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, clipboard, false);
            e.preventDefault();
        },
        [stage, scene, dispatch, setSelection, clipboard, editMode],
    );

    useHotkeys(
        'ctrl+d',
        CATEGORY_SELECTION,
        'Duplicate selected objects',
        (e) => {
            if (!selection.size || !stage || editMode !== EditMode.Normal) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, getSelectedObjects(step, selection), false);
            e.preventDefault();
        },
        [stage, scene, step, dispatch, selection, setSelection, editMode],
    );

    const tetherCallback = useCallback(
        (type: TetherType) => (e: KeyboardEvent) => {
            if (selection.size === 0) {
                // When nothing selected, tether hotkeys should toggle tether tool.
                if (editMode === EditMode.Tether && tetherConfig.tether === type) {
                    setEditMode(EditMode.Normal);
                } else {
                    setEditMode(EditMode.Tether);
                    setTetherConfig({ tether: type });
                }
            } else {
                // When objects are selected and in normal mode, tether hotkeys
                // should directly create tethers.
                if (editMode !== EditMode.Normal) {
                    return;
                }

                const tethers = makeTethers(getSelectedObjects(step, selection), type);
                if (tethers.length === 0) {
                    return;
                }

                dispatch({ type: 'add', object: tethers });
                setSelection(selectNewObjects(scene, tethers.length));
            }

            e.preventDefault();
        },
        [scene, step, dispatch, selection, setSelection, editMode, setEditMode, tetherConfig, setTetherConfig],
    );

    useHotkeys('/', CATEGORY_TETHER, 'Tether', tetherCallback(TetherType.Line), [tetherCallback]);
    useHotkeys('-', CATEGORY_TETHER, 'Tether -/-', tetherCallback(TetherType.MinusMinus), [tetherCallback]);
    useHotkeys('=', CATEGORY_TETHER, 'Tether +/-', tetherCallback(TetherType.PlusMinus), [tetherCallback]);
    useHotkeys('shift+=', '', '', tetherCallback(TetherType.PlusPlus), [tetherCallback]);
    useHotkeyHelp('+', CATEGORY_TETHER, 'Tether +/+');
    useHotkeys('shift+,', '', '', tetherCallback(TetherType.Close), [tetherCallback]);
    useHotkeyHelp('<', CATEGORY_TETHER, 'Tether (stay together)');
    useHotkeys('shift+.', '', '', tetherCallback(TetherType.Far), [tetherCallback]);
    useHotkeyHelp('>', CATEGORY_TETHER, 'Tether (stay apart)');

    return null;
};

const SMALL_MOVE_OFFSET = 1;
const DEFAULT_MOVE_OFFSET = 10;
const LARGE_MOVE_OFFSET = 25;

function rotateObject<T extends MoveableObject>(object: T, center: Vector2d, rotation: number): T {
    const pos = rotateCoord(object, rotation, center);

    const update = { ...object, ...pos };

    if (isRotateable(object)) {
        return {
            ...update,
            rotation: (object.rotation + rotation) % 360,
        };
    }

    return update;
}

const EditActionHandler: React.FC = () => {
    const [selection] = useSelection();
    const { scene, step, dispatch } = useScene();
    const [editMode] = useEditMode();

    const moveCallback = useCallback(
        (offset: Partial<Vector2d>) => (e: KeyboardEvent) => {
            if (editMode !== EditMode.Normal) {
                return;
            }

            const value: SceneObject[] = [];
            selection.forEach((id) => {
                const object = getObjectById(scene, id);
                if (object && isMoveable(object)) {
                    value.push({
                        ...object,
                        x: object.x + (offset?.x ?? 0),
                        y: object.y + (offset?.y ?? 0),
                    } as SceneObject & MoveableObject);
                }
            });

            dispatch({ type: 'update', value });
            e.preventDefault();
        },
        [scene, dispatch, selection, editMode],
    );

    useHotkeys('up', '', '', moveCallback({ y: DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('down', '', '', moveCallback({ y: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('left', '', '', moveCallback({ x: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('right', '', '', moveCallback({ x: DEFAULT_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('ctrl+up', '', '', moveCallback({ y: LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+down', '', '', moveCallback({ y: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+left', '', '', moveCallback({ x: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+right', '', '', moveCallback({ x: LARGE_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('shift+up', '', '', moveCallback({ y: SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+down', '', '', moveCallback({ y: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+left', '', '', moveCallback({ x: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+right', '', '', moveCallback({ x: SMALL_MOVE_OFFSET }), [moveCallback]);

    useHotkeyHelp('🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object');
    useHotkeyHelp('ctrl+🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object (coarse)');
    useHotkeyHelp('shift+🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object (fine)');

    const rotateCallback = useCallback(
        (offset: number) => (e: KeyboardEvent) => {
            if (editMode !== EditMode.Normal) {
                return;
            }

            const value: SceneObject[] = [];
            const center = getGroupCenter(getSelectedObjects(step, selection).filter(isMoveable));

            selection.forEach((id) => {
                const object = getObjectById(scene, id);
                if (object && isMoveable(object)) {
                    value.push(rotateObject(object, center, offset));
                }
            });

            dispatch({ type: 'update', value });
            e.preventDefault();
        },
        [scene, step, dispatch, selection, editMode],
    );

    useHotkeys('ctrl+g', CATEGORY_EDIT, 'Rotate 90° counter-clockwise', rotateCallback(-90), [rotateCallback]);
    useHotkeys('ctrl+h', CATEGORY_EDIT, 'Rotate 90° clockwise', rotateCallback(90), [rotateCallback]);
    useHotkeys('ctrl+j', CATEGORY_EDIT, 'Rotate 180°', rotateCallback(180), [rotateCallback]);

    const orderCallback = useCallback(
        (type: GroupMoveAction['type']) => (e: KeyboardEvent) => {
            dispatch({ type, ids: [...selection] });
            e.preventDefault();
        },
        [dispatch, selection],
    );

    useHotkeys('pageup', CATEGORY_EDIT, 'Move layer up', orderCallback('moveUp'), [orderCallback]);
    useHotkeys('pagedown', CATEGORY_EDIT, 'Move layer down', orderCallback('moveDown'), [orderCallback]);
    useHotkeys('shift+pageup', CATEGORY_EDIT, 'Move to top', orderCallback('moveToTop'), [orderCallback]);
    useHotkeys('shift+pagedown', CATEGORY_EDIT, 'Move to bottom', orderCallback('moveToBottom'), [orderCallback]);

    return null;
};

const HelpHandler: React.FC = () => {
    const [open, setOpen] = useContext(HelpContext);

    useHotkeys(
        'f1',
        CATEGORY_GENERAL,
        'Help',
        (e) => {
            setOpen(true);
            e.preventDefault();
        },
        [setOpen],
    );

    return <HelpDialog open={open} onOpenChange={(ev, data) => setOpen(data.open)} />;
};

const DrawModeHandler: React.FC = () => {
    useHotkeyHelp('e', CATEGORY_DRAW, '(On draw tab) switch to edit mode');
    useHotkeyHelp('d', CATEGORY_DRAW, '(On draw tab) switch to draw mode');

    return null;
};

const StepHandler: React.FC = () => {
    const { dispatch } = useScene();

    useHotkeys(
        'alt+left',
        CATEGORY_STEPS,
        'Previous step',
        (e) => {
            dispatch({ type: 'previousStep' });
            e.preventDefault();
        },
        [dispatch],
    );

    useHotkeys(
        'alt+right',
        CATEGORY_STEPS,
        'Next step',
        (e) => {
            dispatch({ type: 'nextStep' });
            e.preventDefault();
        },
        [dispatch],
    );

    useHotkeys(
        'ctrl+enter',
        CATEGORY_STEPS,
        'Add step',
        (e) => {
            dispatch({ type: 'addStep' });
            e.preventDefault();
        },
        [dispatch],
    );

    return null;
};

export const RegularHotkeyHandler: React.FC = () => {
    return (
        <>
            <HelpHandler />
        </>
    );
};

export const SceneHotkeyHandler: React.FC = () => {
    return (
        <>
            <UndoRedoHandler />
            <SelectionActionHandler />
            <EditActionHandler />
            <DrawModeHandler />
            <StepHandler />
        </>
    );
};
