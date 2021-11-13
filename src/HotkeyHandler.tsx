import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import { getSceneCoord, rotateCoord } from './coord';
import { HelpDialog } from './HelpDialog';
import { HelpContext } from './HelpProvider';
import { useHotkeyHelp, useHotkeys } from './HotkeyHelpProvider';
import { useStage } from './render/StageProvider';
import { isMoveable, isRotateable, MoveableObject, Scene, SceneObject } from './scene';
import { getObjectById, GroupMoveAction, SceneAction, useScene, useSceneUndoRedo } from './SceneProvider';
import {
    getSelectedObjects,
    SceneSelection,
    selectAll,
    selectNewObjects,
    selectNone,
    useSelection,
} from './SelectionProvider';

const CATEGORY_GENERAL = '1.General';
const CATEGORY_SELECTION = '2.Selection';
const CATEGORY_EDIT = '3.Edit';
const CATEGORY_HISTORY = '4.History';

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

function getGroupCenter(objects: readonly MoveableObject[]): Vector2d {
    const moveable = objects.filter(isMoveable);
    if (!moveable.length) {
        return { x: 0, y: 0 };
    }

    const x = moveable.reduce((result, obj) => result + obj.x, 0) / moveable.length;
    const y = moveable.reduce((result, obj) => result + obj.y, 0) / moveable.length;

    return { x, y };
}

function pasteObjects(
    stage: Stage,
    scene: Scene,
    dispatch: Dispatch<SceneAction>,
    setSelection: Dispatch<SetStateAction<SceneSelection>>,
    objects: readonly SceneObject[],
) {
    // TODO: allow copying tethers
    const copyable = objects.filter(isMoveable);
    if (!copyable.length) {
        return;
    }

    const center = getGroupCenter(copyable);
    const mousePos = getSceneCoord(scene, stage.getRelativePointerPosition());

    const newObjects = copyable.map((obj) => {
        const x = obj.x - center.x + mousePos.x;
        const y = obj.y - center.y + mousePos.y;
        return { ...obj, x, y };
    });

    dispatch({ type: 'add', object: newObjects });
    setSelection(selectNewObjects(scene, newObjects.length));
}

const SelectionActionHandler: React.FC = () => {
    const [clipboard, setClipboard] = useState<readonly SceneObject[]>([]);
    const [selection, setSelection] = useSelection();
    const [scene, dispatch] = useScene();
    const stage = useStage();

    useHotkeys(
        'ctrl+a',
        CATEGORY_SELECTION,
        'Select all objects',
        (e) => {
            setSelection(selectAll(scene.objects));
            e.preventDefault();
        },
        [setSelection, scene.objects],
    );

    useHotkeys(
        'escape',
        CATEGORY_SELECTION,
        'Unselect all objects',
        (e) => {
            if (!selection.size) {
                return;
            }
            setSelection(selectNone());
            e.preventDefault();
        },
        [selection, setSelection],
    );

    useHotkeys(
        'delete',
        CATEGORY_SELECTION,
        'Delete selected objects',
        (e) => {
            if (!selection.size) {
                return;
            }
            dispatch({ type: 'remove', ids: [...selection] });
            setSelection(selectNone());
            e.preventDefault();
        },
        [selection, setSelection, dispatch],
    );

    useHotkeys(
        'ctrl+c',
        CATEGORY_SELECTION,
        'Copy selected objects',
        (e) => {
            if (!selection.size) {
                return;
            }
            setClipboard(getSelectedObjects(scene, selection));
            e.preventDefault();
        },
        [scene, selection],
    );

    useHotkeys(
        'ctrl+v',
        CATEGORY_SELECTION,
        'Paste objects',
        (e) => {
            if (!clipboard.length || !stage) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, clipboard);
            e.preventDefault();
        },
        [stage, scene, dispatch, setSelection, clipboard],
    );

    useHotkeys(
        'ctrl+d',
        CATEGORY_SELECTION,
        'Duplicate selected objects',
        (e) => {
            if (!selection.size || !stage) {
                return;
            }
            pasteObjects(stage, scene, dispatch, setSelection, getSelectedObjects(scene, selection));
            e.preventDefault();
        },
        [stage, scene, dispatch, selection, setSelection],
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
    const [selection, setSelection] = useSelection();
    const [scene, dispatch] = useScene();
    const stage = useStage();

    const moveCallback = useCallback(
        (offset: Partial<Vector2d>) => (e: KeyboardEvent) => {
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
        [stage, scene, dispatch, selection],
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
        [stage, scene, dispatch, selection],
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
        </>
    );
};
