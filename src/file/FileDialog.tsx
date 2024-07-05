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
import React, { useMemo, useState } from 'react';
import { OutPortal, createHtmlPortalNode } from 'react-reverse-portal';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { FileSystemNotSupportedMessage, OpenFileSystem, SaveFileSystem } from './FileDialogFileSystem';
import { OpenLocalStorage, SaveLocalStorage } from './FileDialogLocalStorage';
import { ImportFromString } from './FileDialogShare';
import { supportsFs } from './filesystem';

export type OpenDialogProps = Omit<DialogProps, 'children'>;

export const OpenDialog: React.FC<OpenDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<TabValue>(supportsFs ? 'file' : 'localStorage');
    const portalNode = useMemo(() => createHtmlPortalNode({ attributes: { class: classes.actionsPortal } }), [classes]);

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
                            {supportsFs && <Tab value="file">Local file</Tab>}
                            <Tab value="localStorage">Browser storage</Tab>
                            <Tab value="import">Import plan link</Tab>
                            {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                        </TabList>
                        {tab === 'file' && <OpenFileSystem actions={portalNode} />}
                        {tab === 'localStorage' && <OpenLocalStorage actions={portalNode} />}
                        {tab === 'import' && <ImportFromString actions={portalNode} />}
                        {tab === 'fileUnsupported' && <FileSystemNotSupportedMessage actions={portalNode} />}
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
    const portalNode = useMemo(() => createHtmlPortalNode(), []);

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
                            {supportsFs && <Tab value="file">Local file</Tab>}
                            <Tab value="localStorage">Browser storage</Tab>
                            {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                        </TabList>
                        {tab === 'file' && <SaveFileSystem actions={portalNode} />}
                        {tab === 'localStorage' && <SaveLocalStorage actions={portalNode} />}
                        {tab === 'fileUnsupported' && <FileSystemNotSupportedMessage actions={portalNode} download />}
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
