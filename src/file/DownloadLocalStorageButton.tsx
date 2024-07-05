import { Button, ButtonProps, makeStyles } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import React from 'react';
import { useAsyncFn } from 'react-use';
import { downloadBlob } from './blob';
import { exportLocalStorageFiles } from './localStorage';

export const DownloadLocalStorageButton: React.FC<ButtonProps> = ({ ...props }) => {
    const classes = useStyles();

    const [state, download] = useAsyncFn(async () => {
        const blob = await exportLocalStorageFiles();
        downloadBlob(blob, `XIVPlan-export.zip`);
    }, []);

    return (
        <Button
            className={classes.button}
            icon={<ArrowDownloadRegular />}
            onClick={download}
            disabled={state.loading}
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
