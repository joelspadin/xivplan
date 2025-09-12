import {
    Dialog,
    DialogActions,
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
import { OutPortal, createHtmlPortalNode } from 'react-reverse-portal';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { FileSystemNotSupportedMessage, OpenFileSystem, SaveFileSystem } from './FileDialogFileSystem';
import { OpenLocalStorage, SaveLocalStorage } from './FileDialogLocalStorage';
import { ImportFromString } from './FileDialogShare';
import { supportsFs } from './filesystem';

enum Tabs {
    File = 'file',
    LocalStorage = 'localStorage',
    Import = 'import',
    FileUnsupported = 'fileUnsupported',
}

export type OpenDialogProps = Omit<DialogProps, 'children'>;

export const OpenDialog: React.FC<OpenDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(supportsFs ? Tabs.File : Tabs.LocalStorage);
    const portalNode = createHtmlPortalNode({ attributes: { class: classes.actionsPortal } });

    return (
        <Dialog {...props}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>Open file</DialogTitle>
                    <DialogContent className={classes.openContent}>
                        <TabList
                            size="small"
                            className={classes.tabs}
                            selectedValue={tab}
                            onTabSelect={(ev, data) => setTab(data.value)}
                        >
                            {supportsFs && <Tab value={Tabs.File}>Local file</Tab>}
                            <Tab value={Tabs.LocalStorage}>Browser storage</Tab>
                            <Tab value={Tabs.Import}>Import plan link</Tab>
                            {!supportsFs && <Tab value={Tabs.FileUnsupported}>Local file</Tab>}
                        </TabList>
                        {tab === Tabs.File && <OpenFileSystem actions={portalNode} />}
                        {tab === Tabs.LocalStorage && <OpenLocalStorage actions={portalNode} />}
                        {tab === Tabs.Import && <ImportFromString actions={portalNode} />}
                        {tab === Tabs.FileUnsupported && <FileSystemNotSupportedMessage actions={portalNode} />}
                    </DialogContent>
                    <DialogActions fluid className={classes.actionsPortal}>
                        <OutPortal node={portalNode} />
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export type SaveAsDialogProps = Omit<DialogProps, 'children'>;

export const SaveAsDialog: React.FC<SaveAsDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(supportsFs ? 'file' : 'localStorage');
    const portalNode = createHtmlPortalNode();

    return (
        <Dialog {...props}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>Save file</DialogTitle>
                    <DialogContent className={classes.saveContent}>
                        <TabList
                            size="small"
                            className={classes.tabs}
                            selectedValue={tab}
                            onTabSelect={(ev, data) => setTab(data.value)}
                        >
                            {supportsFs && <Tab value={Tabs.File}>Local file</Tab>}
                            <Tab value={Tabs.LocalStorage}>Browser storage</Tab>
                            {!supportsFs && <Tab value={Tabs.FileUnsupported}>Local file</Tab>}
                        </TabList>
                        {tab === Tabs.File && <SaveFileSystem actions={portalNode} />}
                        {tab === Tabs.LocalStorage && <SaveLocalStorage actions={portalNode} />}
                        {tab === Tabs.FileUnsupported && (
                            <FileSystemNotSupportedMessage actions={portalNode} download />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <OutPortal node={portalNode} />
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
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

    actionsPortal: {
        display: 'flex',
        justifyContent: 'end',
        width: '100%',
    },
});
