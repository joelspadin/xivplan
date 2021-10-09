import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useScene, useSceneUndoRedo } from './SceneProvider';
import { selectAll, selectNone, useSelection } from './SelectionProvider';

const UndoRedoHandler: React.FC = () => {
    const [undo, redo] = useSceneUndoRedo();

    useHotkeys('ctrl+z', (e) => {
        undo();
        e.preventDefault();
    });
    useHotkeys('ctrl+y', (e) => {
        redo();
        e.preventDefault();
    });

    return null;
};

const SelectionActionHandler: React.FC = () => {
    const [scene, dispatch] = useScene();
    const [selection, setSelection] = useSelection();

    useHotkeys(
        'ctrl+a',
        (e) => {
            setSelection(selectAll(scene.objects));
            e.preventDefault();
        },
        [setSelection, scene.objects],
    );

    useHotkeys(
        'escape',
        (e) => {
            if (selection.size) {
                setSelection(selectNone());
                e.preventDefault();
            }
        },
        [selection, setSelection],
    );

    useHotkeys(
        'delete',
        (e) => {
            if (selection.size) {
                dispatch({ type: 'remove', index: [...selection] });
                setSelection(selectNone());
                e.preventDefault();
            }
        },
        [selection, setSelection, dispatch],
    );

    return null;
};

export const HotkeyHandler: React.FC = () => {
    return (
        <>
            <UndoRedoHandler />
            <SelectionActionHandler />
        </>
    );
};
