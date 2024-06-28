import {
    Menu,
    MenuButtonProps,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Toolbar,
    ToolbarDivider,
    makeStyles,
} from '@fluentui/react-components';
import {
    ArrowDownloadRegular,
    ArrowRedoRegular,
    ArrowUndoRegular,
    OpenRegular,
    SaveEditRegular,
    SaveRegular,
} from '@fluentui/react-icons';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { CollapsableSplitButton, CollapsableToolbarButton } from './CollapsableToolbarButton';
import { FileSource, useScene, useSceneUndoRedo, useSceneUndoRedoPossible } from './SceneProvider';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialogButton } from './file/ShareDialogButton';
import { downloadScene, getBlobSource } from './file/blob';
import { DialogOpenContext } from './useCloseDialog';
import { useHotkeys } from './useHotkeys';
import { useIsDirty, useSetSavedState } from './useIsDirty';
import { useToolbar } from './useToolbar';

const useStyles = makeStyles({
    toolbar: {
        paddingLeft: 0,
        paddingRight: 0,
    },
});

export const MainToolbar: React.FC = () => {
    const classes = useStyles();
    const [undo, redo] = useSceneUndoRedo();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const [openFileOpen, setOpenFileOpen] = useState(false);

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

    const toolbar = useMemo(() => {
        return (
            <Toolbar className={classes.toolbar}>
                {/* <CollapsableToolbarButton icon={<NewRegular />}>New</CollapsableToolbarButton> */}
                <CollapsableToolbarButton icon={<OpenRegular />} onClick={() => setOpenFileOpen(true)}>
                    Open
                </CollapsableToolbarButton>

                <SaveButton />

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
    }, [undoPossible, redoPossible, classes.toolbar, setOpenFileOpen, undo, redo]);

    useToolbar(toolbar);

    return (
        <>
            <DialogOpenContext.Provider value={setOpenFileOpen}>
                <OpenDialog open={openFileOpen} onOpenChange={(ev, data) => setOpenFileOpen(data.open)} />
            </DialogOpenContext.Provider>
        </>
    );
};

interface SaveButtonState {
    type: 'save' | 'saveas' | 'download';
    text: string;
    icon: ReactElement;
    disabled?: boolean;
}

function getSaveButtonState(source: FileSource | undefined, isDirty: boolean): SaveButtonState {
    if (!source) {
        return { type: 'saveas', text: 'Save as', icon: <SaveEditRegular /> };
    }

    if (source.type === 'blob') {
        return { type: 'download', text: 'Download', icon: <ArrowDownloadRegular /> };
    }

    return { type: 'save', text: 'Save', icon: <SaveRegular />, disabled: !isDirty };
}

interface SaveButtonProps {}

const SaveButton: React.FC<SaveButtonProps> = () => {
    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const { scene, source, dispatch } = useScene();

    const { type, text, icon, disabled } = getSaveButtonState(source, isDirty);

    const save = useCallback(async () => {
        if (!source) {
            setSaveAsOpen(true);
        } else if (isDirty) {
            await saveFile(scene, source);
            setSavedState(scene);
        }
    }, [scene, source, isDirty, setSavedState, setSaveAsOpen]);

    const download = useCallback(() => {
        downloadScene(scene, source?.name);
        if (!source) {
            dispatch({ type: 'setSource', source: getBlobSource() });
        }
    }, [scene, source, dispatch]);

    const handleClick = useCallback(() => {
        switch (type) {
            case 'save':
                save();
                break;

            case 'saveas':
                setSaveAsOpen(true);
                break;

            case 'download':
                download();
                break;
        }
    }, [type, download, save, setSaveAsOpen]);

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

    return (
        <>
            <Menu positioning="below-end">
                <MenuTrigger disableButtonEnhancement>
                    {(triggerProps: MenuButtonProps) => (
                        <CollapsableSplitButton
                            menuButton={triggerProps}
                            primaryActionButton={{ onClick: handleClick, disabled }}
                            icon={icon}
                            appearance="subtle"
                        >
                            {text}
                        </CollapsableSplitButton>
                    )}
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        {type !== 'saveas' && (
                            <MenuItem icon={<SaveEditRegular />} onClick={() => setSaveAsOpen(true)}>
                                Save as...
                            </MenuItem>
                        )}
                        {type !== 'download' && (
                            <MenuItem icon={<ArrowDownloadRegular />} onClick={download}>
                                Download
                            </MenuItem>
                        )}
                    </MenuList>
                </MenuPopover>
            </Menu>
            <DialogOpenContext.Provider value={setSaveAsOpen}>
                <SaveAsDialog open={saveAsOpen} onOpenChange={(ev, data) => setSaveAsOpen(data.open)} />
            </DialogOpenContext.Provider>
        </>
    );
};
