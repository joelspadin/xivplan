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
import { useTranslation } from 'react-i18next';
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
    const portalNode = useMemo(() => createHtmlPortalNode({ attributes: { class: classes.actionsPortal } }), [classes]);
    const { t } = useTranslation();

    return (
        <Dialog {...props}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('FileDialog.OpenDialog.OpenFile')}</DialogTitle>
                    <DialogContent className={classes.openContent}>
                        <TabList
                            size="small"
                            className={classes.tabs}
                            selectedValue={tab}
                            onTabSelect={(ev, data) => setTab(data.value)}
                        >
                            {supportsFs && <Tab value={Tabs.File}>{t('FileDialog.OpenDialog.LocalFile')}</Tab>}
                            <Tab value={Tabs.LocalStorage}>{t('FileDialog.OpenDialog.BrowserStorage')}</Tab>
                            <Tab value={Tabs.Import}>{t('FileDialog.OpenDialog.ImportPlanLink')}</Tab>
                            {!supportsFs && (
                                <Tab value={Tabs.FileUnsupported}>{t('FileDialog.OpenDialog.LocalFile')}</Tab>
                            )}
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
    const portalNode = useMemo(() => createHtmlPortalNode(), []);
    const { t } = useTranslation();

    return (
        <Dialog {...props}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('FileDialog.SaveFile')}</DialogTitle>
                    <DialogContent className={classes.saveContent}>
                        <TabList
                            size="small"
                            className={classes.tabs}
                            selectedValue={tab}
                            onTabSelect={(ev, data) => setTab(data.value)}
                        >
                            {supportsFs && <Tab value={Tabs.File}>{t('FileDialog.OpenDialog.LocalFile')}</Tab>}
                            <Tab value={Tabs.LocalStorage}>{t('FileDialog.OpenDialog.BrowserStorage')}</Tab>
                            {!supportsFs && (
                                <Tab value={Tabs.FileUnsupported}>{t('FileDialog.OpenDialog.LocalFile')}</Tab>
                            )}
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
