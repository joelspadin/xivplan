import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    Tab,
    TabList,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import React, { useState } from 'react';
import { OutPortal, createHtmlPortalNode } from 'react-reverse-portal';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { TabActivity } from '../TabActivity';
import { FileSystemNotSupportedMessage, OpenFileSystem, SaveFileSystem } from './FileDialogFileSystem';
import { OpenLocalStorage, SaveLocalStorage } from './FileDialogLocalStorage';
import { ImportFromString } from './FileDialogShare';
import { supportsFs } from './filesystem';

type Tabs = 'file' | 'localStorage' | 'import' | 'fileUnsupported';

export type OpenDialogProps = Omit<DialogProps, 'children'>;

export const OpenDialog: React.FC<OpenDialogProps> = (props) => {
    const classes = useStyles();
    const [tab, setTab] = useState<Tabs>(supportsFs ? 'file' : 'localStorage');
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
                            onTabSelect={(ev, data) => setTab(data.value as Tabs)}
                        >
                            {supportsFs && <Tab value="file">Local file</Tab>}
                            <Tab value="localStorage">Browser storage</Tab>
                            <Tab value="import">Import plan link</Tab>
                            {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                        </TabList>
                        <TabActivity value="file" activeTab={tab}>
                            <OpenFileSystem actions={portalNode} />
                        </TabActivity>
                        <TabActivity value="localStorage" activeTab={tab}>
                            <OpenLocalStorage actions={portalNode} />
                        </TabActivity>
                        <TabActivity value="import" activeTab={tab}>
                            <ImportFromString actions={portalNode} />
                        </TabActivity>
                        <TabActivity value="fileUnsupported" activeTab={tab}>
                            <FileSystemNotSupportedMessage actions={portalNode} />
                        </TabActivity>
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
    const [tab, setTab] = useState<Tabs>(supportsFs ? 'file' : 'localStorage');
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
                            onTabSelect={(ev, data) => setTab(data.value as Tabs)}
                        >
                            {supportsFs && <Tab value="file">Local file</Tab>}
                            <Tab value="localStorage">Browser storage</Tab>
                            {!supportsFs && <Tab value="fileUnsupported">Local file</Tab>}
                        </TabList>
                        <TabActivity value="file" activeTab={tab}>
                            <SaveFileSystem actions={portalNode} />
                        </TabActivity>
                        <TabActivity value="localStorage" activeTab={tab}>
                            <SaveLocalStorage actions={portalNode} />
                        </TabActivity>
                        <TabActivity value="fileUnsupported" activeTab={tab}>
                            <FileSystemNotSupportedMessage actions={portalNode} download />
                        </TabActivity>
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
