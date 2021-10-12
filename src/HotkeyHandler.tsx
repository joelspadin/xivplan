import { Stage } from 'konva/lib/Stage';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { getSceneCoord } from './coord';
import { HelpDialog } from './HelpDialog';
import { HelpContext } from './HelpProvider';
import { useHotkeys } from './HotkeyHelpProvider';
import { useStage } from './render/StageProvider';
import { isMoveable, Scene, SceneObject } from './scene';
import { SceneAction, useScene, useSceneUndoRedo } from './SceneProvider';
import {
    getSelectedObjects,
    SceneSelection,
    selectAll,
    selectNewObjects,
    selectNone,
    useSelection,
} from './SelectionProvider';

const CATEGORY_HISTORY = 'History';
const CATEGORY_SELECTION = 'Selection';
const CATEGORY_GENERAL = 'General';

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
) {
    // TODO: allow copying tethers
    const copyable = objects.filter(isMoveable);
    if (!copyable.length) {
        return;
    }

    const centerX = copyable.reduce((result, obj) => result + obj.x, 0) / copyable.length;
    const centerY = copyable.reduce((result, obj) => result + obj.y, 0) / copyable.length;

    const mousePos = getSceneCoord(scene, stage.getRelativePointerPosition());

    const newObjects = copyable.map((obj) => {
        const x = obj.x - centerX + mousePos.x;
        const y = obj.y - centerY + mousePos.y;
        return { ...obj, x, y };
    });

    dispatch({ type: 'add', object: newObjects });
    setSelection(selectNewObjects(scene.objects.length, newObjects.length));
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
            dispatch({ type: 'remove', index: [...selection] });
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
        </>
    );
};
