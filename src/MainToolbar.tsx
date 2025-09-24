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
import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InPortal } from 'react-reverse-portal';
import { CollapsableSplitButton, CollapsableToolbarButton } from './CollapsableToolbarButton';
import { FileSource, useScene, useSceneUndoRedo, useSceneUndoRedoPossible, useSetSource } from './SceneProvider';
import { StepScreenshotButton } from './StepScreenshotButton';
import { ToolbarContext } from './ToolbarContext';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialogButton } from './file/ShareDialogButton';
import { downloadScene, getBlobSource } from './file/blob';
import { DialogOpenContext } from './useCloseDialog';
import { useHotkeys } from './useHotkeys';
import { useIsDirty, useSetSavedState } from './useIsDirty';

const useStyles = makeStyles({
    toolbar: {
        paddingLeft: 0,
        paddingRight: 0,
    },
});

export const MainToolbar: React.FC = () => {
    const classes = useStyles();
    const toolbarNode = useContext(ToolbarContext);
    const [undo, redo] = useSceneUndoRedo();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const [openFileOpen, setOpenFileOpen] = useState(false);
    const { t } = useTranslation();

    useHotkeys(
        'ctrl+o',
        { category: '2.File', help: 'Open' },
        (e) => {
            setOpenFileOpen(true);
            e.preventDefault();
        },
        [setOpenFileOpen],
    );

    return (
        <>
            <DialogOpenContext.Provider value={setOpenFileOpen}>
                <OpenDialog open={openFileOpen} onOpenChange={(ev, data) => setOpenFileOpen(data.open)} />
            </DialogOpenContext.Provider>

            <InPortal node={toolbarNode}>
                <Toolbar className={classes.toolbar}>
                    {/* <CollapsableToolbarButton icon={<NewRegular />}>New</CollapsableToolbarButton> */}
                    <CollapsableToolbarButton icon={<OpenRegular />} onClick={() => setOpenFileOpen(true)}>
                        {t('MainToolbar.Open')}
                    </CollapsableToolbarButton>

                    <SaveButton />

                    <CollapsableToolbarButton icon={<ArrowUndoRegular />} onClick={undo} disabled={!undoPossible}>
                        {t('MainToolbar.Undo')}
                    </CollapsableToolbarButton>
                    <CollapsableToolbarButton icon={<ArrowRedoRegular />} onClick={redo} disabled={!redoPossible}>
                        {t('MainToolbar.Redo')}
                    </CollapsableToolbarButton>

                    <ToolbarDivider />

                    <ShareDialogButton>{t('MainToolbar.Share')}</ShareDialogButton>

                    <StepScreenshotButton>{t('MainToolbar.Screenshot')}</StepScreenshotButton>
                </Toolbar>
            </InPortal>
        </>
    );
};

interface SaveButtonState {
    type: 'save' | 'saveas' | 'download';
    text: string;
    icon: ReactElement;
    disabled?: boolean;
}

function getSaveButtonState(
    source: FileSource | undefined,
    isDirty: boolean,
    t: (key: string) => string,
): SaveButtonState {
    if (!source) {
        return { type: 'saveas', text: t('MainToolbar.SaveAs'), icon: <SaveEditRegular /> };
    }

    if (source.type === 'blob') {
        return { type: 'download', text: t('MainToolbar.Download'), icon: <ArrowDownloadRegular /> };
    }

    return { type: 'save', text: t('MainToolbar.Save'), icon: <SaveRegular />, disabled: !isDirty };
}

const SaveButton: React.FC = () => {
    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const { scene, source } = useScene();
    const setSource = useSetSource();
    const { t } = useTranslation();

    const { type, text, icon, disabled } = getSaveButtonState(source, isDirty, t);

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
            setSource(getBlobSource());
        }
    }, [scene, source, setSource]);

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
        { category: '2.File', help: 'Save' },
        (e) => {
            save();
            e.preventDefault();
        },
        [save],
    );
    useHotkeys(
        'ctrl+shift+s',
        { category: '2.File', help: 'Save as' },
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
