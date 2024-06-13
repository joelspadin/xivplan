import {
    ConstrainMode,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    DialogFooter,
    IColumn,
    IconButton,
    PrimaryButton,
    Selection,
    SelectionMode,
    Spinner,
    TextField,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { useAsync, useAsyncFn, useCounter } from 'react-use';
import { FileSource, useLoadScene, useScene } from '../SceneProvider';
import { openFile, saveFile } from '../file';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { FileDialogTabProps, classNames, listStyles } from './FileDialogCommon';
import { confirmDeleteFile, confirmOverwriteFile, confirmUnsavedChanges } from './confirm';
import { LocalStorageFileInfo, deleteFileLocalStorage, listLocalStorageFiles } from './localStorage';

const getOpenFileColumns = (theme: Theme, reloadFiles: () => void) =>
    [
        {
            key: 'name',
            name: 'Name',
            fieldName: 'name',
            minWidth: 200,
        },
        {
            key: 'modified',
            name: 'Date modified',
            fieldName: 'lastModified',
            minWidth: 200,
            onRender: (item: LocalStorageFileInfo) => item.lastEdited?.toLocaleString(),
        },
        {
            key: 'delete',
            name: '',
            minWidth: 32,
            onRender: (item: LocalStorageFileInfo) => (
                <IconButton
                    className={classNames.listButton}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={async () => {
                        if (await confirmDeleteFile(item.name, theme)) {
                            await deleteFileLocalStorage(item.name);
                            reloadFiles();
                        }
                    }}
                />
            ),
        },
    ] as IColumn[];

export const OpenLocalStorage: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    const loadScene = useLoadScene();
    const isDirty = useIsDirty();
    const theme = useTheme();

    const [counter, { inc: reloadFiles }] = useCounter();
    const { value: files, error, loading } = useAsync(listLocalStorageFiles, [counter]);

    const columns = useMemo(() => getOpenFileColumns(theme, reloadFiles), [theme, reloadFiles]);

    const forceUpdate = useForceUpdate();
    const selection = useConst(() => new Selection({ onSelectionChanged: forceUpdate }));

    const loadSceneFromStorage = useCallback(
        async (name: string) => {
            if (isDirty && !(await confirmUnsavedChanges(theme))) {
                return;
            }

            const source: FileSource = { type: 'local', name };
            const scene = await openFile(source);

            loadScene(scene, source);
            onDismiss?.();
        },
        [theme, isDirty, loadScene, onDismiss],
    );

    const itemInvokedCallback = useCallback(
        async (item?: LocalStorageFileInfo) => {
            if (item) {
                loadSceneFromStorage(item.name);
            }
        },
        [loadSceneFromStorage],
    );

    const openCallback = useCallback(async () => {
        const index = selection.getSelectedIndices()[0] ?? 0;
        const name = files?.[index]?.name;
        if (!name) {
            return;
        }

        await loadSceneFromStorage(name);
    }, [selection, files, loadSceneFromStorage]);

    if (loading) {
        return <Spinner />;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    if (!files) {
        return null;
    }

    // TODO: selection broke after updating libraries. Can't figure out why.
    // Just replace this with Fluent UI 9 DataGrid/Table?
    return (
        <>
            <DetailsList
                columns={columns}
                items={files}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                constrainMode={ConstrainMode.unconstrained}
                selectionMode={SelectionMode.single}
                selection={selection}
                onItemInvoked={itemInvokedCallback}
                styles={listStyles}
                compact
            />
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Open" disabled={selection.count === 0} onClick={openCallback} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

function getInitialName(source: FileSource | undefined) {
    return source?.type === 'local' ? source.name : undefined;
}

export const SaveBrowserStorage: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    const setSavedState = useSetSavedState();
    const files = useAsync(listLocalStorageFiles);
    const { scene, source, dispatch } = useScene();
    const [name, setName] = useState(getInitialName(source));
    const theme = useTheme();

    const alreadyExists = useMemo(() => files.value?.some((f) => f.name === name), [files.value, name]);
    const canSave = !!name && !files.loading;

    const [saveState, save] = useAsyncFn(async () => {
        if (!canSave) {
            return;
        }

        if (alreadyExists) {
            if (!(await confirmOverwriteFile(theme))) {
                return;
            }
        }

        const source: FileSource = { type: 'local', name };
        await saveFile(scene, source);

        dispatch({ type: 'setSource', source });
        setSavedState(scene);
        onDismiss?.();
    }, [scene, name, canSave, alreadyExists, theme, dispatch, onDismiss, setSavedState]);

    const onKeyPress = useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (ev.key === 'Enter') {
                save();
            }
        },
        [save],
    );

    if (saveState.loading) {
        return <Spinner />;
    }

    return (
        <>
            <div className={classNames.form}>
                <TextField
                    label="File name"
                    value={name}
                    onChange={(e, v) => setName(v)}
                    onKeyUp={onKeyPress}
                    errorMessage={alreadyExists ? 'A file with this name already exists.' : undefined}
                />
            </div>

            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Save" disabled={!canSave} onClick={save} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};
