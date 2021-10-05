import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { getDeleteSelectionAction } from './actions';
import { useScene, useSceneUndoRedo } from './SceneProvider';
import { useSelection } from './SelectionProvider';

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
    const [, dispatch] = useScene();
    const [selection, setSelection] = useSelection();

    useHotkeys(
        'delete',
        (e) => {
            if (selection) {
                dispatch(getDeleteSelectionAction(selection));
                setSelection(undefined);
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