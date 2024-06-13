import { DefaultButton, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScene } from './SceneProvider';
import { openFile } from './file';
import { getFileSource } from './file/filesystem';

function isFile(handle: FileSystemHandle): handle is FileSystemFileHandle {
    return handle.kind === 'file';
}

/**
 * Page for the /open route, which waits for a file from window.launchQueue,
 * then opens it.
 */
export const FileOpenPage: React.FC = () => {
    const [error, setError] = useState<ReactNode>();
    const navigate = useNavigate();
    const loadScene = useLoadScene();

    const navigateToMainPage = useCallback(() => {
        navigate('/', { replace: true });
    }, [navigate]);

    useEffect(() => {
        if (window.launchQueue) {
            window.launchQueue.setConsumer(async (params) => {
                const file = params.files[0];
                if (!file || !isFile(file)) {
                    setError('No file in launch queue');
                    return;
                }

                try {
                    const source = getFileSource(file);
                    const scene = await openFile(source);

                    // TODO: add to recent files list

                    loadScene(scene, source);
                    navigateToMainPage();
                } catch (ex) {
                    console.error('Failed to open file', ex);
                    if (ex instanceof Error) {
                        setError(
                            <>
                                <strong>Failed to open &quot;{file.name}&quot;</strong>
                                <div>{ex.toString()}</div>
                            </>,
                        );
                    }
                }
            });
        } else {
            console.error('Cannot open file. This browser does not support window.launchQueue.');
            navigateToMainPage();
        }
    }, [loadScene, navigateToMainPage, setError]);

    return (
        <Stack tokens={{ padding: 20, childrenGap: 20 }} horizontalAlign="start">
            {error && (
                <MessageBar messageBarType={MessageBarType.error} delayedRender={false}>
                    {error}
                </MessageBar>
            )}
            <DefaultButton text="Return" onClick={navigateToMainPage} />
        </Stack>
    );
};
