import { DefaultButton, DialogFooter, PrimaryButton, TextField, useTheme } from '@fluentui/react';
import React, { FormEvent, useCallback, useState } from 'react';
import { useLoadScene } from '../SceneProvider';
import { textToScene } from '../file';
import { Scene } from '../scene';
import { useIsDirty } from '../useIsDirty';
import { FileDialogTabProps, classNames } from './FileDialogCommon';
import { confirmUnsavedChanges } from './confirm';
import { parseSceneLink } from './share';

export const ImportFromString: React.FC<FileDialogTabProps> = ({ onDismiss }) => {
    const loadScene = useLoadScene();
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

        loadScene(scene);
        onDismiss?.();
    }, [data, isDirty, theme, loadScene, onDismiss]);

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
                rows={6}
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
