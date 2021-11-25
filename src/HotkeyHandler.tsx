import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useContext, useState } from 'react';
import { rotateCoord } from './coord';
import { getGroupCenter, pasteObjects } from './copy';
import { EditMode, useEditMode, useTetherConfig } from './EditModeProvider';
import { HelpDialog } from './HelpDialog';
import { HelpContext } from './HelpProvider';
import { useHotkeyHelp, useHotkeys } from './HotkeyHelpProvider';
import { makeTethers } from './prefabs/Tethers';
import { useStage } from './render/StageProvider';
import { isMoveable, isRotateable, MoveableObject, SceneObject, TetherType } from './scene';
import { getObjectById, GroupMoveAction, useScene, useSceneUndoRedo } from './SceneProvider';
import { getSelectedObjects, selectAll, selectNewObjects, selectNone, useSelection } from './SelectionProvider';

const CATEGORY_GENERAL = '1.General';
const CATEGORY_HISTORY = '2.History';
const CATEGORY_SELECTION = '3.Selection';
const CATEGORY_EDIT = '4.Edit';
const CATEGORY_TETHER = '5.Tether';
const CATEGORY_DRAW = '6.Draw';

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

const SelectionActionHandler: React.FC = () => {
    const [clipboard, setClipboard] = useState<readonly SceneObject[]>([]);
    const [selection, setSelection] = useSelection();
    const [editMode, setEditMode] = useEditMode();
    const [tetherConfig, setTetherConfig] = useTetherConfig();
    const [scene, dispatch] = useScene();
    const stage = useStage();

    useHotkeys(
        'ctrl+a',
        CATEGORY_SELECTION,
        'Select all objects',
        (e) => {
            if (editMode !== EditMode.Normal) {
                return;
            }
            setSelection(selectAll(scene.objects));
            e.preventDefault();
        },
        [setSelection, scene.objects, editMode],
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
            setClipboard(getSelectedObjects(scene, selection));
            e.preventDefault();
        },
        [scene, selection, editMode],
    );
    useHotkeys(
        'ctrl+v',
        CATEGORY_SELECTION,
        'Paste objects',
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
        'ctrl+d',
        CATEGORY_SELECTION,
        'Duplicate selected objects',
        (e) => {
            if (!selection.size || !stage || editMode !== EditMode.Normal) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, getSelectedObjects(scene, selection), false);
            e.preventDefault();
        },
        [stage, scene, dispatch, selection, setSelection, editMode],
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

                const tethers = makeTethers(getSelectedObjects(scene, selection), type);
                if (tethers.length === 0) {
                    return;
                }

                dispatch({ type: 'add', object: tethers });
                setSelection(selectNewObjects(scene, tethers.length));
            }

            e.preventDefault();
        },
        [scene, dispatch, selection, setSelection, editMode, setEditMode, tetherConfig, setTetherConfig],
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
    const [selection, setSelection] = useSelection();
    const [scene, dispatch] = useScene();
    const [editMode] = useEditMode();
    const stage = useStage();

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
                    });
                }
            });

            dispatch({ type: 'update', value });
            e.preventDefault();
        },
        [stage, scene, dispatch, selection, editMode],
    );

    useHotkeys('up', '', '', moveCallback({ y: DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('down', '', '', moveCallback({ y: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('left', '', '', moveCallback({ x: -DEFAULT_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('right', '', '', moveCallback({ x: DEFAULT_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('ctrl+up', '', '', moveCallback({ y: LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+down', '', '', moveCallback({ y: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+left', '', '', moveCallback({ x: -LARGE_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('ctrl+right', '', '', moveCallback({ x: LARGE_MOVE_OFFSET }), [moveCallback]);

    useHotkeys('alt+up', '', '', moveCallback({ y: SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('alt+down', '', '', moveCallback({ y: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('alt+left', '', '', moveCallback({ x: -SMALL_MOVE_OFFSET }), [moveCallback]);
    useHotkeys('alt+right', '', '', moveCallback({ x: SMALL_MOVE_OFFSET }), [moveCallback]);

    useHotkeyHelp('🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object');
    useHotkeyHelp('ctrl+🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object (coarse)');
    useHotkeyHelp('alt+🡐🡑🡓🡒', CATEGORY_EDIT, 'Move object (fine)');

    const rotateCallback = useCallback(
        (offset: number) => (e: KeyboardEvent) => {
            if (editMode !== EditMode.Normal) {
                return;
            }

            const value: SceneObject[] = [];
            const center = getGroupCenter(getSelectedObjects(scene, selection).filter(isMoveable));

            selection.forEach((id) => {
                const object = getObjectById(scene, id);
                if (object && isMoveable(object)) {
                    value.push(rotateObject(object, center, offset));
                }
            });

            dispatch({ type: 'update', value });
            e.preventDefault();
        },
        [stage, scene, dispatch, selection, editMode],
    );

    useHotkeys('ctrl+g', CATEGORY_EDIT, 'Rotate 90° counter-clockwise', rotateCallback(-90), [rotateCallback]);
    useHotkeys('ctrl+h', CATEGORY_EDIT, 'Rotate 90° clockwise', rotateCallback(90), [rotateCallback]);
    useHotkeys('ctrl+j', CATEGORY_EDIT, 'Rotate 180°', rotateCallback(180), [rotateCallback]);

    const orderCallback = useCallback(
        (type: GroupMoveAction['type']) => (e: KeyboardEvent) => {
            dispatch({ type, ids: [...selection] });
            e.preventDefault();
        },
        [dispatch, selection, setSelection],
    );

    useHotkeys('pageup', CATEGORY_EDIT, 'Move layer up', orderCallback('moveUp'), [orderCallback]);
    useHotkeys('pagedown', CATEGORY_EDIT, 'Move layer down', orderCallback('moveDown'), [orderCallback]);
    useHotkeys('shift+pageup', CATEGORY_EDIT, 'Move to top', orderCallback('moveToTop'), [orderCallback]);
    useHotkeys('shift+pagedown', CATEGORY_EDIT, 'Move to bottom', orderCallback('moveToBottom'), [orderCallback]);

    return null;
};

const HelpHandler: React.FC = () => {
    const [isOpen, { setTrue: showHelp, setFalse: hideHelp }] = useContext(HelpContext);

    useHotkeys(
        'f1',
        CATEGORY_GENERAL,
        'Open help',
        (e) => {
            showHelp();
            e.preventDefault();
        },
        [showHelp],
    );

    return <HelpDialog isOpen={isOpen} onDismiss={hideHelp} />;
};

const DrawModeHandler: React.FC = () => {
    useHotkeyHelp('e', CATEGORY_DRAW, '(On draw tab) switch to edit mode');
    useHotkeyHelp('d', CATEGORY_DRAW, '(On draw tab) switch to draw mode');

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
        </>
    );
};
