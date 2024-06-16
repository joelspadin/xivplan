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
import { ArrowRedoRegular, ArrowUndoRegular, OpenRegular, SaveEditRegular, SaveRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { CollapsableSplitButton, CollapsableToolbarButton } from './CollapsableToolbarButton';
import { useHotkeys } from './HotkeyHelpProvider';
import { useScene, useSceneUndoRedo, useSceneUndoRedoPossible } from './SceneProvider';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialogButton } from './file/ShareDialogButton';
import { useIsDirty, useSetSavedState } from './useIsDirty';
import { useToolbar } from './useToolbar';

export const MainToolbar: React.FC = () => {
    const [openFileOpen, setOpenFileOpen] = useState(false);
    const [saveAsOpen, setSaveAsOpen] = useState(false);

    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [undo, redo] = useSceneUndoRedo();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const { scene, source } = useScene();

    const save = useCallback(async () => {
        if (!source) {
            setSaveAsOpen(true);
        } else if (isDirty) {
            await saveFile(scene, source);
            setSavedState(scene);
        }
    }, [scene, source, isDirty, setSavedState, setSaveAsOpen]);

    useHotkeys(
        'ctrl+o',
        '2.File',
        'Open',
        (e) => {
            setOpenFileOpen(true);
            e.preventDefault();
        },
        [setOpenFileOpen],
    );
    useHotkeys(
        'ctrl+s',
        '2.File',
        'Save',
        (e) => {
            save();
            e.preventDefault();
        },
        [save],
    );
    useHotkeys(
        'ctrl+shift+s',
        '2.File',
        'Save as',
        (e) => {
            setSaveAsOpen(true);
            e.preventDefault();
        },
        [setSaveAsOpen],
    );

    const toolbar = useMemo(() => {
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
                        <MenuItem icon={<SaveEditRegular />} onClick={() => setSaveAsOpen(true)}>
                            Save as...
                        </MenuItem>
                    </MenuList>
                </MenuPopover>
            </Menu>
        );

        const saveAsButton = (
            <CollapsableToolbarButton icon={<SaveEditRegular />} onClick={() => setSaveAsOpen(true)}>
                Save as
            </CollapsableToolbarButton>
        );

        return (
            <Toolbar>
                {/* <CollapsableToolbarButton icon={<NewRegular />}>New</CollapsableToolbarButton> */}
                <CollapsableToolbarButton icon={<OpenRegular />} onClick={() => setOpenFileOpen(true)}>
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
    }, [source, isDirty, undoPossible, redoPossible, undo, redo, save, setOpenFileOpen]);

    useToolbar(toolbar);

    return (
        <>
            <OpenDialog open={openFileOpen} onOpenChange={(ev, data) => setOpenFileOpen(data.open)} />
            <SaveAsDialog open={saveAsOpen} onOpenChange={(ev, data) => setSaveAsOpen(data.open)} />
        </>
    );
};
