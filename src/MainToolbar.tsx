import {
    Menu,
    MenuButtonProps,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Toolbar,
    ToolbarDivider,
} from '@fluentui/react-components';
import { useBoolean } from '@fluentui/react-hooks';
import { ArrowRedoRegular, ArrowUndoRegular, OpenRegular, SaveEditRegular, SaveRegular } from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { CollapsableSplitButton, CollapsableToolbarButton } from './CollapsableToolbarButton';
import { useScene, useSceneUndoRedo, useSceneUndoRedoPossible } from './SceneProvider';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialogButton } from './file/ShareDialogButton';
import { useIsDirty, useSetSavedState } from './useIsDirty';
import { useToolbar } from './useToolbar';

export const MailToolbar: React.FC = () => {
    const [openFileOpen, { setTrue: showOpenFile, setFalse: hideOpenFile }] = useBoolean(false);
    const [saveAsOpen, { setTrue: showSaveAs, setFalse: hideSaveAs }] = useBoolean(false);

    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [undo, redo] = useSceneUndoRedo();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const { scene, source } = useScene();

    const save = useCallback(async () => {
        if (source) {
            await saveFile(scene, source);
            setSavedState(scene);
        }
    }, [scene, source, setSavedState]);

    const saveButton = (
        <Menu positioning="below-end">
            <MenuTrigger disableButtonEnhancement>
                {(triggerProps: MenuButtonProps) => (
                    <CollapsableSplitButton
                        menuButton={triggerProps}
                        primaryActionButton={{ onClick: save, disabled: !isDirty }}
                        icon={<SaveRegular />}
                        appearance="subtle"
                    >
                        Save
                    </CollapsableSplitButton>
                )}
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem icon={<SaveEditRegular />} onClick={showSaveAs}>
                        Save as...
                    </MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    );

    const saveAsButton = (
        <CollapsableToolbarButton icon={<SaveEditRegular />} onClick={showSaveAs}>
            Save as
        </CollapsableToolbarButton>
    );

    const toolbar = (
        <Toolbar>
            {/* <CollapsableToolbarButton icon={<NewRegular />}>New</CollapsableToolbarButton> */}
            <CollapsableToolbarButton icon={<OpenRegular />} onClick={showOpenFile}>
                Open
            </CollapsableToolbarButton>

            {source ? saveButton : saveAsButton}

            <CollapsableToolbarButton icon={<ArrowUndoRegular />} onClick={undo} disabled={!undoPossible}>
                Undo
            </CollapsableToolbarButton>
            <CollapsableToolbarButton icon={<ArrowRedoRegular />} onClick={redo} disabled={!redoPossible}>
                Redo
            </CollapsableToolbarButton>

            <ToolbarDivider />

            <ShareDialogButton>Share</ShareDialogButton>
        </Toolbar>
    );

    useToolbar(toolbar);

    return (
        <>
            <OpenDialog isOpen={openFileOpen} onDismiss={hideOpenFile} />
            <SaveAsDialog isOpen={saveAsOpen} onDismiss={hideSaveAs} />
        </>
    );
};
