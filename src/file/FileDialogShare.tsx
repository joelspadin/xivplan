import { Button, DialogTrigger, Field, Textarea, TextareaOnChangeData } from '@fluentui/react-components';
import React, { ChangeEvent, MouseEvent, useCallback, useRef, useState } from 'react';
import { useLoadScene } from '../SceneProvider';
import { textToScene } from '../file';
import { Scene } from '../scene';
import { useDialogActions } from '../useDialogActions';
import { useDismissDialog } from '../useDismissDialog';
import { useIsDirty } from '../useIsDirty';
import { useConfirmUnsavedChanges } from './confirm';
import { parseSceneLink } from './share';

export const ImportFromString: React.FC = () => {
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();
    const dismissDialog = useDismissDialog();
    const importButtonRef = useRef<HTMLButtonElement>(null);

    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();
    const [data, setData] = useState<string | undefined>('');
    const [error, setError] = useState<string | undefined>('');

    const importCallback = useCallback(
        async (event: MouseEvent<HTMLElement>) => {
            if (!data) {
                return;
            }

            if (isDirty) {
                if (!(await confirmUnsavedChanges())) {
                    return;
                }
            }

            const scene = decodeScene(data);
            if (!scene) {
                setError('Invalid link');
                return;
            }

            loadScene(scene);
            dismissDialog(event);
        },
        [data, isDirty, loadScene, dismissDialog, confirmUnsavedChanges],
    );

    const onChange = useCallback(
        (ev: ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
            setData(data.value);
            setError(undefined);
        },
        [setError, setData],
    );

    const onKeyUp = useCallback((ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            importButtonRef.current?.click();
        }
    }, []);

    useDialogActions(
        <>
            <Button ref={importButtonRef} appearance="primary" disabled={!data} onClick={importCallback}>
                Import
            </Button>
            <DialogTrigger>
                <Button>Cancel</Button>
            </DialogTrigger>
        </>,
    );

    return (
        <>
            <Field label="Enter plan link" validationState={error ? 'error' : 'none'} validationMessage={error}>
                <Textarea rows={4} onChange={onChange} onKeyUp={onKeyUp} />
            </Field>

            {renderModal()}
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