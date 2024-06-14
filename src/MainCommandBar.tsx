import {
    Menu,
    MenuButtonProps,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    SplitButton,
    Toolbar,
    ToolbarButton,
} from '@fluentui/react-components';
import { useBoolean } from '@fluentui/react-hooks';
import {
    ArrowRedoRegular,
    ArrowUndoRegular,
    OpenRegular,
    SaveEditRegular,
    SaveRegular,
    ShareRegular,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { useScene, useSceneUndoRedo, useSceneUndoRedoPossible } from './SceneProvider';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialog } from './file/ShareDialog';
import { useIsDirty, useSetSavedState } from './useIsDirty';
import { useToolbar } from './useToolbar';

export const MainCommandBar: React.FC = () => {
    const [openFileOpen, { setTrue: showOpenFile, setFalse: hideOpenFile }] = useBoolean(false);
    const [saveAsOpen, { setTrue: showSaveAs, setFalse: hideSaveAs }] = useBoolean(false);
    const [shareOpen, { setTrue: showShare, setFalse: hideShare }] = useBoolean(false);

    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [undo, redo] = useSceneUndoRedo();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const { scene, source } = useScene();

    const save = useCallback(async () => {
        if (source) {
            await saveFile(scene, source);
            setSavedState(scene);
        } else {
            showSaveAs();
        }
    }, [scene, source, setSavedState, showSaveAs]);

    const saveButton = (
        <Menu positioning="below-end">
            <MenuTrigger disableButtonEnhancement>
                {(triggerProps: MenuButtonProps) => (
                    <SplitButton
                        menuButton={triggerProps}
                        primaryActionButton={{ onClick: save, disabled: !isDirty }}
                        icon={<SaveRegular />}
                        appearance="subtle"
                    >
                        Save
                    </SplitButton>
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
        <ToolbarButton icon={<SaveEditRegular />} onClick={showSaveAs}>
            Save as
        </ToolbarButton>
    );

    const toolbar = (
        <Toolbar>
            {/* <ToolbarButton icon={<NewRegular />}>New</ToolbarButton> */}
            <ToolbarButton icon={<OpenRegular />} onClick={showOpenFile}>
                Open
            </ToolbarButton>
            {source ? saveButton : saveAsButton}
            <ToolbarButton icon={<ArrowUndoRegular />} onClick={undo} disabled={!undoPossible}>
                Undo
            </ToolbarButton>
            <ToolbarButton icon={<ArrowRedoRegular />} onClick={redo} disabled={!redoPossible}>
                Redo
            </ToolbarButton>
            <ToolbarButton icon={<ShareRegular />} onClick={showShare}>
                Share
            </ToolbarButton>
        </Toolbar>
    );

    useToolbar(toolbar);

    return (
        <>
            <OpenDialog isOpen={openFileOpen} onDismiss={hideOpenFile} />
            <SaveAsDialog isOpen={saveAsOpen} onDismiss={hideSaveAs} />
            <ShareDialog isOpen={shareOpen} onDismiss={hideShare} />
        </>
    );
};
