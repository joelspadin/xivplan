import {
    ConstrainMode,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    DialogFooter,
    IColumn,
    IconButton,
    IDetailsListStyles,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    mergeStyleSets,
    Pivot,
    PivotItem,
    PrimaryButton,
    Selection,
    SelectionMode,
    Spinner,
    TextField,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { useAsync, useAsyncFn, useCounter } from 'react-use';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { openFile, saveFile, textToScene } from '../file';
import { Scene } from '../scene';
import { FileSource, useLoadScene, useScene } from '../SceneProvider';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { confirmDeleteFile, confirmOverwriteFile, confirmUnsavedChanges } from './confirm';
import { deleteFileLocal, FileEntry, listLocalFiles } from './localFile';
import { parseSceneLink } from './share';

const classNames = mergeStyleSets({
    tab: {
        minHeight: 200,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gridTemplateAreas: `
            "content"
            "footer"
        `,
    } as IStyle,
    form: {
        gridArea: 'content',
        marginTop: 20,
    } as IStyle,
    footer: {
        gridArea: 'footer',
    } as IStyle,

    listButton: {
        margin: '-7px 0 -7px',
    } as IStyle,
});

export const OpenDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Open File" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <OpenLocalFile onDismiss={props.onDismiss} />
                </PivotItem>
                {/* <PivotItem headerText="GitHub Gist" className={classNames.tab}>
                    <p>TODO</p>
                </PivotItem> */}
                <PivotItem headerText="Import Plan Link" className={classNames.tab}>
                    <ImportFromString onDismiss={props.onDismiss} />
                </PivotItem>
            </Pivot>
        </BaseDialog>
    );
};

export const SaveAsDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Save As" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <SaveLocalFile onDismiss={props.onDismiss} />
                </PivotItem>
                {/* <PivotItem headerText="GitHub Gist" className={classNames.tab}>
                    <p>TODO</p>
                </PivotItem> */}
            </Pivot>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        minWidth: 500,
    },
};

interface SourceTabProps {
    onDismiss?: () => void;
}

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
            onRender: (item: FileEntry) => item.lastEdited?.toLocaleString(),
        },
        {
            key: 'delete',
            name: '',
            minWidth: 32,
            onRender: (item: FileEntry) => (
                <IconButton
                    className={classNames.listButton}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={async () => {
                        if (await confirmDeleteFile(item.name, theme)) {
                            await deleteFileLocal(item.name);
                            reloadFiles();
                        }
                    }}
                />
            ),
        },
    ] as IColumn[];

const listStyles: Partial<IDetailsListStyles> = {
    root: {
        overflowX: 'auto',
        width: '100%',
        '& [role=grid]': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            maxHeight: '50vh',
        } as IStyle,
    },
    headerWrapper: {
        flex: '0 0 auto',
    },
    contentWrapper: {
        flex: '1 1 auto',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
};

const OpenLocalFile: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const loadScene = useLoadScene();
    const setSavedState = useSetSavedState();
    const isDirty = useIsDirty();
    const theme = useTheme();

    const [counter, { inc: reloadFiles }] = useCounter();
    const { value: files, error, loading } = useAsync(listLocalFiles, [counter]);

    const columns = useMemo(() => getOpenFileColumns(theme, reloadFiles), [theme, reloadFiles]);

    const forceUpdate = useForceUpdate();
    const selection = useConst(() => new Selection({ onSelectionChanged: forceUpdate }));

    const openCallback = useCallback(async () => {
        if (isDirty) {
            if (!(await confirmUnsavedChanges(theme))) {
                return;
            }
        }

        const index = selection.getSelectedIndices()[0] ?? 0;
        const name = files?.[index]?.name;
        if (!name) {
            return;
        }

        const source: FileSource = { type: 'local', name };
        const scene = await openFile(source);

        loadScene(scene, source);
        setSavedState(scene);
        onDismiss?.();
    }, [selection, files, isDirty, theme, loadScene, setSavedState, onDismiss]);

    if (loading) {
        return <Spinner />;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    if (!files) {
        return null;
    }

    return (
        <>
            <DetailsList
                columns={columns}
                items={files}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                constrainMode={ConstrainMode.unconstrained}
                selectionMode={SelectionMode.single}
                selection={selection}
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

function decodeScene(text: string): Scene | undefined {
    try {
        return parseSceneLink(new URL(text));
    } catch (ex) {
        if (!(ex instanceof TypeError)) {
            console.error('Invalid plan data', ex);
            return undefined;
        }
    }

    // Not a URL. Try as plain data.
    try {
        return textToScene(decodeURIComponent(text));
    } catch (ex) {
        console.error('Invalid plan data', ex);
    }

    return undefined;
}

const ImportFromString: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const loadScene = useLoadScene();
    const setSavedState = useSetSavedState();
    const isDirty = useIsDirty();
    const theme = useTheme();
    const [data, setData] = useState<string | undefined>('');
    const [error, setError] = useState<string | undefined>('');

    const importCallback = useCallback(async () => {
        if (!data) {
            return;
        }

        if (isDirty) {
            if (!(await confirmUnsavedChanges(theme))) {
                return;
            }
        }

        const scene = decodeScene(data);
        if (!scene) {
            setError('Invalid link');
            return;
        }

        loadScene(scene, undefined);
        setSavedState(scene);
        onDismiss?.();
    }, [data, isDirty, theme, loadScene, setSavedState, onDismiss]);

    const onChange = useCallback(
        (ev: FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
            setData(value);
            setError(undefined);
        },
        [setError, setData],
    );

    const onKeyDown = useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                importCallback();
            }
        },
        [importCallback],
    );

    return (
        <>
            <TextField
                label="Enter plan link"
                multiline
                rows={7}
                onChange={onChange}
                onKeyDown={onKeyDown}
                errorMessage={error}
            />
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Import" disabled={!data} onClick={importCallback} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

function getInitialName(source: FileSource | undefined) {
    return source?.type === 'local' ? source.name : undefined;
}

const SaveLocalFile: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const setSavedState = useSetSavedState();
    const files = useAsync(listLocalFiles);
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
                    onKeyPress={onKeyPress}
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
