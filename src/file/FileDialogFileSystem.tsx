import { DefaultButton, DialogFooter, IStackTokens, PrimaryButton, Spinner, Stack, useTheme } from '@fluentui/react';
import React, { useCallback } from 'react';
import { useAsync, useCounter } from 'react-use';
import { ExternalLink } from '../ExternalLink';
import { useLoadScene, useScene } from '../SceneProvider';
import { openFile, saveFile } from '../file';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { FileDialogTabProps, classNames } from './FileDialogCommon';
import { confirmUnsavedChanges } from './confirm';
import {
    addRecentFile,
    getFileSource,
    getPlanFolder,
    setPlanFolder,
    showOpenPlanPicker,
    showPlanFolderPicker,
    showSavePlanPicker,
} from './filesystem';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export const OpenFileSystem: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    const theme = useTheme();
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();

    const [counter, { inc: reloadFolder }] = useCounter();
    const planFolder = useAsync(getPlanFolder, [counter]);

    const loadSceneFromFile = useCallback(
        async (handle: FileSystemFileHandle) => {
            if (isDirty && !(await confirmUnsavedChanges(theme))) {
                return;
            }

            const source = getFileSource(handle);
            const scene = await openFile(source);

            loadScene(scene, source);
            onDismiss?.();
        },
        [theme, isDirty, loadScene, onDismiss],
    );

    const pickFolder = useCallback(async () => {
        const handle = await showPlanFolderPicker();
        if (handle) {
            await setPlanFolder(handle);
            reloadFolder();
        }
    }, [reloadFolder]);

    const pickFile = useCallback(async () => {
        const handle = await showOpenPlanPicker();
        if (handle) {
            await loadSceneFromFile(handle);
        }
    }, [loadSceneFromFile]);

    return (
        <>
            <div className={classNames.form}>
                <Stack horizontal tokens={stackTokens} horizontalAlign="space-between">
                    <DefaultButton text="Open file" onClick={pickFile} />
                    <DefaultButton text="Browse folder" onClick={pickFolder} />
                </Stack>
                {planFolder.loading ? <Spinner /> : <FileBrowser root={planFolder.value} />}
            </div>
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Open" disabled />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

export const SaveFileSystem: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    const setSavedState = useSetSavedState();
    const { scene, source, dispatch } = useScene();

    const currentName = source?.name;

    const save = useCallback(async () => {
        const handle = await showSavePlanPicker(currentName);
        if (!handle) {
            return;
        }

        const source = await getFileSource(handle);
        await saveFile(scene, source);
        await addRecentFile(handle);

        dispatch({ type: 'setSource', source });
        setSavedState(scene);
        onDismiss?.();
    }, [scene, currentName, dispatch, onDismiss, setSavedState]);

    return (
        <>
            <div className={classNames.form}>
                <p>Click &quot;Save as&quot; below to save the plan to your computer.</p>
            </div>
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Save as" onClick={save} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

export const FileSystemNotSupportedMessage: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    return (
        <>
            <div>
                <p>Your browser does not support the experimental File System API.</p>
                <p>
                    To save files locally, use a Chromium-based browser such as{' '}
                    <ExternalLink href="https://www.microsoft.com/edge">Edge</ExternalLink> or{' '}
                    <ExternalLink href="https://www.google.com/chrome/">Chrome</ExternalLink>.
                </p>
            </div>
            <DialogFooter className={classNames.footer}>
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

interface FileBrowserProps {
    root?: FileSystemDirectoryHandle;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ root }) => {
    if (!root) {
        return <p>No folder selected.</p>;
    }

    return (
        <>
            <p>TODO: A file browser for folder {root.name} will go here eventually.</p>
            <p>For now, just use the &quot;Open file&quot; button.</p>
        </>
    );
};
