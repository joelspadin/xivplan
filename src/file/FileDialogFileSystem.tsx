import { Button, DialogActions, DialogTrigger } from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { ExternalLink } from '../ExternalLink';
import { useLoadScene, useScene, useSetSource } from '../SceneProvider';
import { openFile, saveFile } from '../file';
import { useCloseDialog } from '../useCloseDialog';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { DownloadButton } from './DownloadButton';
import { FileBrowser } from './FileBrowser';
import { useConfirmUnsavedChanges } from './confirm';
import { addRecentFile, getFileSource, showSavePlanPicker } from './filesystem';

export interface OpenFileSystemProps {
    actions: HtmlPortalNode;
}

export const OpenFileSystem: React.FC<OpenFileSystemProps> = ({ actions }) => {
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();
    const dismissDialog = useCloseDialog();
    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();
    const [selectedFile, setSelectedFile] = useState<FileSystemFileHandle>();
    const { t } = useTranslation();

    const loadSceneFromFile = useCallback(
        async (handle: FileSystemFileHandle) => {
            if (isDirty && !(await confirmUnsavedChanges())) {
                return;
            }

            const source = getFileSource(handle);
            const scene = await openFile(source);

            loadScene(scene, source);
            dismissDialog();
        },
        [isDirty, loadScene, dismissDialog, confirmUnsavedChanges],
    );

    return (
        <>
            <FileBrowser onSelectionChanged={setSelectedFile} onFileSelected={loadSceneFromFile} />
            {renderModal()}
            <InPortal node={actions}>
                <DialogActions>
                    <Button
                        appearance="primary"
                        disabled={!selectedFile}
                        onClick={() => selectedFile && loadSceneFromFile(selectedFile)}
                    >
                        {t('FileDialogFileSystem.Open')}
                    </Button>
                    <DialogTrigger>
                        <Button>{t('FileDialogFileSystem.Cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};

export interface SaveFileSystemProps {
    actions: HtmlPortalNode;
}

export const SaveFileSystem: React.FC<SaveFileSystemProps> = ({ actions }) => {
    const setSavedState = useSetSavedState();
    const dismissDialog = useCloseDialog();
    const setSource = useSetSource();
    const { scene, source } = useScene();
    const { t } = useTranslation();

    const currentName = source?.name;

    const save = useCallback(async () => {
        const handle = await showSavePlanPicker(currentName);
        if (!handle) {
            return;
        }

        const source = getFileSource(handle);
        await saveFile(scene, source);
        await addRecentFile(handle);

        setSource(source);
        setSavedState(scene);
        dismissDialog();
    }, [scene, currentName, setSource, setSavedState, dismissDialog]);

    return (
        <>
            <div>
                <p>{t('FileDialogFileSystem.SaveFileSystem_description')}</p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    <Button appearance="primary" onClick={save}>
                        {t('FileDialogFileSystem.SaveAs')}
                    </Button>
                    <DialogTrigger>
                        <Button>{t('FileDialogFileSystem.Cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};

export interface FileSystemNotSupportedMessageProps {
    actions: HtmlPortalNode;
    download?: boolean;
}

export const FileSystemNotSupportedMessage: React.FC<FileSystemNotSupportedMessageProps> = ({ actions, download }) => {
    const { t } = useTranslation();
    return (
        <>
            <div>
                <p>
                    <Trans
                        key="FileDialogFileSystem.FileSystemNotSupportedMessage1"
                        components={[<strong key={'FileSystemNotSupportedMessage'}></strong>]}
                    ></Trans>
                </p>
                <p>
                    <Trans
                        key="FileDialogFileSystem.FileSystemNotSupportedMessage2"
                        components={[
                            <ExternalLink key="Edge" href="https://www.microsoft.com/edge"></ExternalLink>,
                            <ExternalLink key="Chrome" href="https://www.google.com/chrome/"></ExternalLink>,
                        ]}
                    ></Trans>
                </p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    {download && <DownloadButton appearance="primary" />}
                    <DialogTrigger>
                        <Button>{t('FileDialogFileSystem.Cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};
