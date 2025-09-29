import { Button, DialogActions, DialogTrigger } from '@fluentui/react-components';
import React, { useState } from 'react';
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

    const loadSceneFromFile = async (handle: FileSystemFileHandle) => {
        if (isDirty && !(await confirmUnsavedChanges())) {
            return;
        }

        const source = getFileSource(handle);
        const scene = await openFile(source);

        loadScene(scene, source);
        dismissDialog();
    };

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
                        Open
                    </Button>
                    <DialogTrigger>
                        <Button>Cancel</Button>
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
    const { canonicalScene, source } = useScene();

    const currentName = source?.name;

    const save = async () => {
        const handle = await showSavePlanPicker(currentName);
        if (!handle) {
            return;
        }

        const source = getFileSource(handle);
        await saveFile(canonicalScene, source);
        await addRecentFile(handle);

        setSource(source);
        setSavedState(canonicalScene);
        dismissDialog();
    };

    return (
        <>
            <div>
                <p>Click &quot;Save as&quot; below to save the plan to your computer.</p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    <Button appearance="primary" onClick={save}>
                        Save as
                    </Button>
                    <DialogTrigger>
                        <Button>Cancel</Button>
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
    return (
        <>
            <div>
                <p>
                    Your browser does not support the experimental File System API. You can download the plan as an{' '}
                    <strong>.xivplan</strong> file, then drag and drop it onto the page to open it again.
                </p>
                <p>
                    To save files locally, use a Chromium-based browser such as{' '}
                    <ExternalLink href="https://www.microsoft.com/edge">Edge</ExternalLink> or{' '}
                    <ExternalLink href="https://www.google.com/chrome/">Chrome</ExternalLink>.
                </p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    {download && <DownloadButton appearance="primary" />}
                    <DialogTrigger>
                        <Button>Cancel</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};
