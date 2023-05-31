import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { useCallback, useMemo } from 'react';
import { useScene, useSceneUndoRedo } from './SceneProvider';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { useCommandBar } from './useCommandBar';
import { useIsDirty, useSetSavedState } from './useIsDirty';

export const MainCommandBar: React.FC = () => {
    const [openFileOpen, { setTrue: showOpenFile, setFalse: hideOpenFile }] = useBoolean(false);
    const [saveAsOpen, { setTrue: showSaveAs, setFalse: hideSaveAs }] = useBoolean(false);
    // const [shareOpen, { setTrue: showShare, setFalse: hideShare }] = useBoolean(false);

    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [undo, redo] = useSceneUndoRedo();
    const { scene, source } = useScene();

    const save = useCallback(async () => {
        if (source) {
            await saveFile(scene, source);
            setSavedState(scene);
        } else {
            showSaveAs();
        }
    }, [scene, source, setSavedState, showSaveAs]);

    const items = useMemo<ICommandBarItemProps[]>(
        () => [
            {
                key: 'open',
                text: 'Open',
                iconProps: { iconName: 'OpenFile' },
                onClick: showOpenFile,
            },
            {
                key: 'save',
                text: 'Save',
                iconProps: { iconName: 'Save' },
                primaryDisabled: !isDirty,
                onClick: () => {
                    save();
                },
                split: true,
                subMenuProps: {
                    items: [
                        { key: 'saveAs', text: 'Save as...', iconProps: { iconName: 'SaveAs' }, onClick: showSaveAs },
                    ],
                },
            },
            {
                key: 'undo',
                text: 'Undo',
                iconProps: { iconName: 'Undo' },
                disabled: !undo.isPossible,
                onClick: undo,
            },
            {
                key: 'redo',
                text: 'Redo',
                iconProps: { iconName: 'Redo' },
                disabled: !redo.isPossible,
                onClick: redo,
            },
            // {
            //     key: 'share',
            //     text: 'Share',
            //     iconProps: { iconName: 'Share' },
            //     onClick: showShare,
            // },
        ],
        [save, isDirty, undo, redo, showOpenFile, showSaveAs],
    );

    useCommandBar(<CommandBar items={items} />, [items]);

    return (
        <>
            <OpenDialog isOpen={openFileOpen} onDismiss={hideOpenFile} />
            <SaveAsDialog isOpen={saveAsOpen} onDismiss={hideSaveAs} />
            {/* <ShareDialog isOpen={shareOpen} onDismiss={hideShare} /> */}
        </>
    );
};
