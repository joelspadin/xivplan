import { Button, type ButtonProps, makeStyles } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import { useAsync } from '@react-hookz/web';
import React from 'react';
import { downloadBlob } from './blob';
import { exportLocalStorageFiles } from './localStorage';

export const DownloadLocalStorageButton: React.FC<ButtonProps> = ({ ...props }) => {
    const classes = useStyles();

    const [state, { execute: download }] = useAsync(async () => {
        const blob = await exportLocalStorageFiles();
        downloadBlob(blob, `XIVPlan-export.zip`);
    });

    return (
        <Button
            className={classes.button}
            icon={<ArrowDownloadRegular />}
            onClick={download}
            disabled={state.status === 'loading'}
            {...props}
        >
            Download all
        </Button>
    );
};

const useStyles = makeStyles({
    button: {
        marginRight: 'auto',
    },
});
