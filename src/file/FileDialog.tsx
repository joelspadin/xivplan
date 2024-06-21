import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    Tab,
    TabList,
    TabValue,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import React, { useState } from 'react';
import { DialogActionsPortal, DialogActionsPortalProvider } from '../DialogActionsPortal';
import { FileSystemNotSupportedMessage, OpenFileSystem, SaveFileSystem } from './FileDialogFileSystem';
import { OpenLocalStorage, SaveLocalStorage } from './FileDialogLocalStorage';
import { ImportFromString } from './FileDialogShare';
import { supportsFs } from './filesystem';

export type OpenDialogProps = Omit<DialogProps, 'children'>;

export const OpenDialog: React.FC<OpenDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(supportsFs ? 'file' : 'localStorage');

    return (
        <DialogActionsPortalProvider>
            <Dialog {...props}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Open file</DialogTitle>
                        <DialogContent className={classes.openContent}>
                            <TabList
                                size="small"
                                className={classes.tabs}
                                selectedValue={tab}
                                onTabSelect={(ev, data) => setTab(data.value)}
                            >
                                {supportsFs && <Tab value="file">Local file</Tab>}
                                <Tab value="localStorage">Browser storage</Tab>
                                <Tab value="import">Import plan link</Tab>
                                {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                            </TabList>
                            {tab === 'file' && <OpenFileSystem />}
                            {tab === 'localStorage' && <OpenLocalStorage />}
                            {tab === 'import' && <ImportFromString />}
                            {tab === 'fileUnsupported' && <FileSystemNotSupportedMessage />}
                        </DialogContent>
                        <DialogActionsPortal />
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </DialogActionsPortalProvider>
    );
};

export type SaveAsDialogProps = Omit<DialogProps, 'children'>;

export const SaveAsDialog: React.FC<SaveAsDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(supportsFs ? 'file' : 'localStorage');

    return (
        <DialogActionsPortalProvider>
            <Dialog {...props}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Save file</DialogTitle>
                        <DialogContent className={classes.saveContent}>
                            <TabList
                                size="small"
                                className={classes.tabs}
                                selectedValue={tab}
                                onTabSelect={(ev, data) => setTab(data.value)}
                            >
                                {supportsFs && <Tab value="file">Local file</Tab>}
                                <Tab value="localStorage">Browser storage</Tab>
                                {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                            </TabList>
                            {tab === 'file' && <SaveFileSystem />}
                            {tab === 'localStorage' && <SaveLocalStorage />}
                            {tab === 'fileUnsupported' && <FileSystemNotSupportedMessage download />}
                        </DialogContent>
                        <DialogActionsPortal />
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </DialogActionsPortalProvider>
    );
};

const useStyles = makeStyles({
    openContent: {
        minHeight: '200px',
    },

    saveContent: {
        minHeight: '140px',
    },

    tabs: {
        marginBottom: tokens.spacingVerticalM,
    },
});
