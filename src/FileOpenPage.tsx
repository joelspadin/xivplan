import { Button, makeStyles, tokens } from '@fluentui/react-components';
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileLoader } from './useFileLoader';

function isFile(handle: FileSystemHandle): handle is FileSystemFileHandle {
    return handle.kind === 'file';
}

/**
 * Page for the /open route, which waits for a file from window.launchQueue,
 * then opens it.
 */
export const FileOpenPage: React.FC = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const loadFile = useFileLoader();
    const [error, setError] = useState<ReactNode>();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- https://github.com/reactwg/react-compiler/discussions/18
    const navigateToMainPage = () => navigate('/', { replace: true });

    useEffect(() => {
        if (window.launchQueue) {
            window.launchQueue.setConsumer(async (params) => {
                const file = params.files[0];
                if (!file || !isFile(file)) {
                    setError('No file in launch queue');
                    return;
                }

                try {
                    await loadFile(file);
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
    }, [loadFile, navigateToMainPage, setError]);

    return (
        <div className={classes.root}>
            {error && <div className={classes.error}>{error}</div>}
            <Button onClick={navigateToMainPage}>Return</Button>
        </div>
    );
};

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'start',
        gap: tokens.spacingVerticalL,
        padding: tokens.spacingVerticalL,
    },

    error: {
        color: tokens.colorStatusDangerForeground2,
        backgroundColor: tokens.colorStatusDangerBackground2,
        borderRadius: tokens.borderRadiusMedium,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    },
});
