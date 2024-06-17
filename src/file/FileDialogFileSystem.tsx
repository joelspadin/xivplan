import { Button, DialogTrigger, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import React, { MouseEvent, useCallback } from 'react';
import { useAsync, useCounter } from 'react-use';
import { ExternalLink } from '../ExternalLink';
import { useLoadScene, useScene } from '../SceneProvider';
import { openFile, saveFile } from '../file';
import { useCloseDialog } from '../useCloseDialog';
import { useDialogActions } from '../useDialogActions';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { useConfirmUnsavedChanges } from './confirm';
import {
    addRecentFile,
    getFileSource,
    getPlanFolder,
    setPlanFolder,
    showOpenPlanPicker,
    showPlanFolderPicker,
    showSavePlanPicker,
} from './filesystem';

export const OpenFileSystem: React.FC = () => {
    const classes = useStyles();
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();
    const dismissDialog = useCloseDialog();
    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();

    const [counter, { inc: reloadFolder }] = useCounter();
    const planFolder = useAsync(getPlanFolder, [counter]);

    const loadSceneFromFile = useCallback(
        async (event: MouseEvent<HTMLButtonElement>, handle: FileSystemFileHandle) => {
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

    const pickFolder = useCallback(async () => {
        const handle = await showPlanFolderPicker();
        if (handle) {
            await setPlanFolder(handle);
            reloadFolder();
        }
    }, [reloadFolder]);

    const pickFile = useCallback(
        async (event: MouseEvent<HTMLButtonElement>) => {
            const handle = await showOpenPlanPicker();
            if (handle) {
                await loadSceneFromFile(event, handle);
            }
        },
        [loadSceneFromFile],
    );

    useDialogActions(
        <>
            <Button appearance="primary" disabled>
                Open
            </Button>
            <DialogTrigger>
                <Button>Cancel</Button>
            </DialogTrigger>
        </>,
    );

    return (
        <>
            <div className={classes.root}>
                <div className={classes.topBar}>
                    <Button onClick={pickFile}>Open file</Button>
                    <Button onClick={pickFolder}>Browser folder</Button>
                </div>
                {planFolder.loading ? <Spinner /> : <FileBrowser root={planFolder.value} />}
            </div>
            {renderModal()}
        </>
    );
};

export const SaveFileSystem: React.FC = () => {
    const setSavedState = useSetSavedState();
    const dismissDialog = useCloseDialog();
    const { scene, source, dispatch } = useScene();

    const currentName = source?.name;

    const save = useCallback(
        async (event: MouseEvent<HTMLButtonElement>) => {
            const handle = await showSavePlanPicker(currentName);
            if (!handle) {
                return;
            }

            const source = await getFileSource(handle);
            await saveFile(scene, source);
            await addRecentFile(handle);

            dispatch({ type: 'setSource', source });
            setSavedState(scene);
            dismissDialog();
        },
        [scene, currentName, dispatch, setSavedState, dismissDialog],
    );

    useDialogActions(
        <>
            <Button appearance="primary" onClick={save}>
                Save as
            </Button>
            <DialogTrigger>
                <Button>Cancel</Button>
            </DialogTrigger>
        </>,
    );

    return (
        <>
            <div>
                <p>Click &quot;Save as&quot; below to save the plan to your computer.</p>
            </div>
        </>
    );
};

export const FileSystemNotSupportedMessage: React.FC = () => {
    useDialogActions(
        <>
            <DialogTrigger>
                <Button>Cancel</Button>
            </DialogTrigger>
        </>,
    );

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

const useStyles = makeStyles({
    root: {
        marginTop: tokens.spacingVerticalM,
    },

    topBar: {
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'space-between',
    },
});
