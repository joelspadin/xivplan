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
import { commonValue, setOrOmit } from './util';

const CATEGORY_GENERAL = '1.General';
const CATEGORY_HISTORY = '2.History';
const CATEGORY_SELECTION = '3.Selection';
const CATEGORY_EDIT = '4.Edit';
const CATEGORY_TETHER = '5.Tether';
const CATEGORY_DRAW = '6.Draw';
const CATEGORY_STEPS = '7.Steps';

const UndoRedoHandler: React.FC = () => {
    const [undo, redo] = useSceneUndoRedo();

    useHotkeys('ctrl+z', { category: CATEGORY_HISTORY, help: 'Undo' }, (e) => {
        undo();
        e.preventDefault();
    });
    useHotkeys('ctrl+y', { category: CATEGORY_HISTORY, help: 'Redo' }, (e) => {
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

function toggleHide(objects: readonly SceneObject[], dispatch: Dispatch<SceneAction>) {
    const show = commonValue(objects, (obj) => !obj.hide);

    dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hide', !!show)) });
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
        { category: CATEGORY_SELECTION, help: 'Select all objects' },
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
        { category: CATEGORY_SELECTION, help: 'Unselect all, cancel tool' },
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
        { category: CATEGORY_SELECTION, help: 'Delete selected objects' },
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
        { category: CATEGORY_SELECTION, help: 'Copy selected objects' },
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
        { category: CATEGORY_SELECTION, help: 'Cut selected objects' },
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
        { category: CATEGORY_SELECTION, help: 'Paste objects at mouse' },
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
        { category: CATEGORY_SELECTION, help: 'Paste objects at original location' },
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
        { category: CATEGORY_SELECTION, help: 'Duplicate selected objects' },
        (e) => {
            if (!selection.size || !stage || editMode !== EditMode.Normal) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, getSelectedObjects(step, selection), false);
            e.preventDefault();
        },
        [stage, scene, step, dispatch, selection, setSelection, editMode],
    );

    useHotkeys(
        'h',
        { category: CATEGORY_SELECTION, help: 'Show/hide selected objects' },
        (e) => {
            // This will fire together with CTRL+H, so ignore it in that case.
            if (!selection.size || e.ctrlKey) {
                return;
            }

            toggleHide(getSelectedObjects(step, selection), dispatch);
        },
        { useKey: true },
        [step, dispatch, selection],
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

    useHotkeys('/', { category: CATEGORY_TETHER, help: 'Tether' }, tetherCallback(TetherType.Line), { useKey: true }, [
        tetherCallback,
    ]);
    useHotkeys(
        '-',
        { category: CATEGORY_TETHER, help: 'Tether -/-' },
        tetherCallback(TetherType.MinusMinus),
        { useKey: true },
        [tetherCallback],
    );
    useHotkeys(
        '=',
        { category: CATEGORY_TETHER, help: 'Tether +/-' },
        tetherCallback(TetherType.PlusMinus),
        { useKey: true },
        [tetherCallback],
    );
    useHotkeys(
        'shift+equal',
        { category: CATEGORY_TETHER, help: 'Tether +/+', keys: '+' },
        tetherCallback(TetherType.PlusPlus),
        { useKey: true },
        [tetherCallback],
    );
    useHotkeys(
        '<',
        { category: CATEGORY_TETHER, help: 'Tether (stay together)' },
        tetherCallback(TetherType.Close),
        { useKey: true },
        [tetherCallback],
    );
    useHotkeys(
        'shift+period',
        { category: CATEGORY_TETHER, help: 'Tether (stay apart)', keys: '>' },
        tetherCallback(TetherType.Far),
        { useKey: true },
        [tetherCallback],
    );

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

    useHotkeys('up', {}, moveCallback({ y: DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('down', {}, moveCallback({ y: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('left', {}, moveCallback({ x: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('right', {}, moveCallback({ x: DEFAULT_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('ctrl+up', {}, moveCallback({ y: LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+down', {}, moveCallback({ y: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+left', {}, moveCallback({ x: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+right', {}, moveCallback({ x: LARGE_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('shift+up', {}, moveCallback({ y: SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+down', {}, moveCallback({ y: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+left', {}, moveCallback({ x: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('shift+right', {}, moveCallback({ x: SMALL_MOVE_OFFSET }), [moveCallback]);

    useHotkeyHelp({ keys: '🡐🡑🡓🡒', category: CATEGORY_EDIT, help: 'Move object' });
    useHotkeyHelp({ keys: 'ctrl+🡐🡑🡓🡒', category: CATEGORY_EDIT, help: 'Move object (coarse)' });
    useHotkeyHelp({ keys: 'shift+🡐🡑🡓🡒', category: CATEGORY_EDIT, help: 'Move object (fine)' });

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

    useHotkeys('ctrl+g', { category: CATEGORY_EDIT, help: 'Rotate 90° counter-clockwise' }, rotateCallback(-90), [
        rotateCallback,
    ]);
    useHotkeys('ctrl+h', { category: CATEGORY_EDIT, help: 'Rotate 90° clockwise' }, rotateCallback(90), [
        rotateCallback,
    ]);
    useHotkeys('ctrl+j', { category: CATEGORY_EDIT, help: 'Rotate 180°' }, rotateCallback(180), [rotateCallback]);

    const orderCallback = useCallback(
        (type: GroupMoveAction['type']) => (e: KeyboardEvent) => {
            dispatch({ type, ids: [...selection] });
            e.preventDefault();
        },
        [dispatch, selection],
    );

    useHotkeys('pageup', { category: CATEGORY_EDIT, help: 'Move layer up' }, orderCallback('moveUp'), [orderCallback]);
    useHotkeys('pagedown', { category: CATEGORY_EDIT, help: 'Move layer down' }, orderCallback('moveDown'), [
        orderCallback,
    ]);
    useHotkeys('shift+pageup', { category: CATEGORY_EDIT, help: 'Move to top' }, orderCallback('moveToTop'), [
        orderCallback,
    ]);
    useHotkeys('shift+pagedown', { category: CATEGORY_EDIT, help: 'Move to bottom' }, orderCallback('moveToBottom'), [
        orderCallback,
    ]);

    return null;
};

const HelpHandler: React.FC = () => {
    const [open, setOpen] = useContext(HelpContext);

    useHotkeys(
        'f1',
        { category: CATEGORY_GENERAL, help: 'Help' },
        (e) => {
            setOpen(true);
            e.preventDefault();
        },
        [setOpen],
    );

    return <HelpDialog open={open} onOpenChange={(ev, data) => setOpen(data.open)} />;
};

const DrawModeHandler: React.FC = () => {
    useHotkeyHelp({ keys: 'e', category: CATEGORY_DRAW, help: '(On draw tab) switch to edit mode' });
    useHotkeyHelp({ keys: 'd', category: CATEGORY_DRAW, help: '(On draw tab) switch to draw mode' });

    return null;
};

const StepHandler: React.FC = () => {
    const { dispatch } = useScene();

    useHotkeys(
        'alt+left',
        { category: CATEGORY_STEPS, help: 'Previous step' },
        (e) => {
            dispatch({ type: 'previousStep' });
            e.preventDefault();
        },
        [dispatch],
    );

    useHotkeys(
        'alt+right',
        { category: CATEGORY_STEPS, help: 'Next step' },
        (e) => {
            dispatch({ type: 'nextStep' });
            e.preventDefault();
        },
        [dispatch],
    );

    useHotkeys(
        'ctrl+enter',
        { category: CATEGORY_STEPS, help: 'Add step' },
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
