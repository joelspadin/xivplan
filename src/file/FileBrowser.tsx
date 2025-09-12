import {
    Breadcrumb,
    BreadcrumbButton,
    BreadcrumbDivider,
    BreadcrumbItem,
    Button,
    DataGrid,
    DataGridBody,
    DataGridCell,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridRow,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Overflow,
    OverflowDivider,
    OverflowItem,
    PartitionBreadcrumbItems,
    TableCellLayout,
    TableColumnDefinition,
    TableRowId,
    createTableColumn,
    makeStyles,
    mergeClasses,
    partitionBreadcrumbItems,
    tokens,
    useIsOverflowItemVisible,
    useOverflowMenu,
} from '@fluentui/react-components';
import {
    DocumentRegular,
    FolderFilled,
    FolderOpen20Regular,
    MoreHorizontalFilled,
    MoreHorizontalRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { getPlanFolder, showOpenPlanPicker, showPlanFolderPicker } from './filesystem';

const MoreHorizontal = bundleIcon(MoreHorizontalFilled, MoreHorizontalRegular);

const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
        columnId: 'file',
        compare: compareItemNames,
        renderHeaderCell: () => 'File',
        renderCell: (item) => {
            return <TableCellLayout media={getItemIcon(item)}>{item.handle.name}</TableCellLayout>;
        },
    }),
    createTableColumn<Item>({
        columnId: 'lastUpdated',
        compare: compareItemDates,
        renderHeaderCell: () => 'Last updated',
        renderCell: (item) => {
            return <TableCellLayout>{item.lastModified?.toLocaleString()}</TableCellLayout>;
        },
    }),
];

export interface FileBrowserProps {
    className?: string;

    onSelectionChanged?: (handle: FileSystemFileHandle | undefined) => void;
    onFileSelected?: (handle: FileSystemFileHandle) => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = (props) => {
    const folder = useAsync(getPlanFolder);

    // Render an empty browser until folder.value resolves, then replace the
    // whole component to avoid needing to handl changes to "planFolder" inside.
    return <FileBrowserInner key={folder.value ? 0 : 1} planFolder={folder.value} {...props} />;
};

interface FileBrowserInnerProps extends FileBrowserProps {
    planFolder: FileSystemDirectoryHandle | undefined;
}

const FileBrowserInner: React.FC<FileBrowserInnerProps> = ({
    className,
    planFolder,
    onSelectionChanged,
    onFileSelected,
}) => {
    const classes = useStyles();
    const [tree, setTree] = useState(new DirectoryTree());
    const [root, setRootInner] = useState(planFolder);
    const [folder, setFolderInner] = useState(planFolder);
    const [selectedRows, setSelectedRowsInner] = useState(new Set<TableRowId>());

    const parents = folder ? tree.getPath(folder).split('/') : [];

    const items = useAsync(async () => {
        return root && folder ? await tree.getEntries(root, folder) : [];
    }, [tree, root, folder]);

    // Fire selection changed event whenever the list of items changes, or the
    // selected item changes.
    const fireSelectionChanged = (selection: Set<TableRowId>) => {
        const selectedFile = findSelectedFile(items.value ?? [], selection);
        onSelectionChanged?.(selectedFile);
    };

    const setSelectedRows = (value: Set<TableRowId>) => {
        setSelectedRowsInner(value);
        fireSelectionChanged(value);
    };

    const setFolder = (handle: FileSystemDirectoryHandle | undefined) => {
        setFolderInner(handle);
        setSelectedRows(new Set());
    };

    const setRoot = (handle: FileSystemDirectoryHandle | undefined) => {
        setRootInner(handle);
        setFolder(handle);
        setTree(new DirectoryTree());
    };

    const navigateToParent = (index?: number) => {
        index = index ?? parents.length - 1;

        const path = parents.slice(0, index + 1).join('/');
        if (path) {
            const folder = tree.findParent(path);
            if (folder) {
                setFolder(folder);
            }
        }
    };

    const handleDoubleClick = (item: Item) => {
        switch (item.handle.kind) {
            case 'directory':
                setFolder(item.handle);
                break;

            case 'file':
                onFileSelected?.(item.handle);
                break;
        }
    };

    const pickFolder = async () => {
        const handle = await showPlanFolderPicker();
        if (handle) {
            setRoot(handle);
        }
    };

    const pickFile = async () => {
        const handle = await showOpenPlanPicker();
        if (handle) {
            onFileSelected?.(handle);
        }
    };

    // TODO: add keyboard navigation

    return (
        <div className={className}>
            <div className={classes.topBar}>
                <Button appearance="primary" onClick={pickFile}>
                    Open file
                </Button>
                <Button onClick={pickFolder}>Browse folder</Button>
            </div>
            <ParentBreadcrumb parents={parents} navigateToParent={navigateToParent} />

            <DataGrid
                items={items.value ?? []}
                columns={columns}
                getRowId={(item: Item) => item.handle.name}
                size="small"
                selectionMode="single"
                selectedItems={selectedRows}
                onSelectionChange={(ev, data) => setSelectedRows(data.selectedItems)}
                defaultSortState={{ sortColumn: 'file', sortDirection: 'ascending' }}
                focusMode="composite"
                subtleSelection
                sortable
            >
                <DataGridHeader>
                    <DataGridRow>
                        {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
                    </DataGridRow>
                </DataGridHeader>
                <DataGridBody<Item> className={classes.fileList}>
                    {({ item, rowId }) => (
                        <DataGridRow<Item>
                            key={rowId}
                            className={classes.row}
                            selectionCell={{ radioIndicator: { 'aria-label': 'Select row' } }}
                            onDoubleClick={() => handleDoubleClick(item)}
                        >
                            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                        </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
    );
};

interface ParentItem {
    name: string;
    index: number;
}

const OverflowGroupDivider: React.FC<{
    groupId: string;
}> = (props) => {
    return (
        <OverflowDivider groupId={props.groupId}>
            <BreadcrumbDivider data-group={props.groupId} />
        </OverflowDivider>
    );
};

function renderBreadcrumbItem(
    el: ParentItem,
    currentClassName: string,
    navigateToParent: (index: number) => void,
    isLastItem: boolean,
) {
    return (
        <React.Fragment key={`button-items-${el.index}`}>
            <OverflowItem
                id={el.index.toString()}
                groupId={el.index.toString()}
                priority={el.index === 0 ? 9999 : el.index}
            >
                <BreadcrumbItem>
                    <BreadcrumbButton
                        current={isLastItem}
                        className={mergeClasses(isLastItem && currentClassName)}
                        onClick={() => navigateToParent(el.index)}
                    >
                        {el.name}
                    </BreadcrumbButton>
                </BreadcrumbItem>
            </OverflowItem>
            {!isLastItem && <OverflowGroupDivider groupId={el.index.toString()} />}
        </React.Fragment>
    );
}

interface OverflowMenuItemProps {
    item: ParentItem;
    navigateToParent: (index: number) => void;
}

const OverflowMenuItem: React.FC<OverflowMenuItemProps> = ({ item, navigateToParent }) => {
    const isVisible = useIsOverflowItemVisible(item.index.toString());

    if (isVisible) {
        return null;
    }

    return (
        <MenuItem key={item.index} onClick={() => navigateToParent(item.index)}>
            {item.name}
        </MenuItem>
    );
};

interface OverflowMenuProps extends PartitionBreadcrumbItems<ParentItem> {
    navigateToParent: (index: number) => void;
}

const OverflowMenu: React.FC<OverflowMenuProps> = ({
    startDisplayedItems,
    overflowItems,
    endDisplayedItems,
    navigateToParent,
}) => {
    const { ref, isOverflowing, overflowCount } = useOverflowMenu<HTMLButtonElement>();

    if (!isOverflowing) {
        return null;
    }

    const overflowItemsCount = overflowItems ? overflowItems.length + overflowCount : overflowCount;

    return (
        <>
            <BreadcrumbItem>
                <Menu hasIcons>
                    <MenuTrigger disableButtonEnhancement>
                        <Button
                            ref={ref}
                            appearance="subtle"
                            icon={<MoreHorizontal />}
                            aria-label={`${overflowItemsCount} more items`}
                            role="button"
                        />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            {isOverflowing &&
                                startDisplayedItems.map((item) => (
                                    <OverflowMenuItem
                                        key={item.index}
                                        item={item}
                                        navigateToParent={navigateToParent}
                                    />
                                ))}
                            {overflowItems &&
                                overflowItems.map((item) => (
                                    <OverflowMenuItem
                                        key={item.index}
                                        item={item}
                                        navigateToParent={navigateToParent}
                                    />
                                ))}
                            {isOverflowing &&
                                endDisplayedItems &&
                                endDisplayedItems.map((item) => (
                                    <OverflowMenuItem
                                        key={item.index}
                                        item={item}
                                        navigateToParent={navigateToParent}
                                    />
                                ))}
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </BreadcrumbItem>
            <BreadcrumbDivider />
        </>
    );
};

interface ParentBreadcrumbProps {
    parents: string[];
    navigateToParent: (index: number) => void;
}

const ParentBreadcrumb: React.FC<ParentBreadcrumbProps> = ({ parents, navigateToParent }) => {
    const classes = useStyles();

    const items: ParentItem[] = parents.map((name, index) => ({ name, index }));

    const { startDisplayedItems, overflowItems, endDisplayedItems } = partitionBreadcrumbItems({
        items,
        maxDisplayedItems: 5,
    });

    return (
        <div className={classes.path}>
            <Overflow>
                <Breadcrumb>
                    <FolderOpen20Regular className={classes.pathIcon} />

                    {startDisplayedItems?.map((item) => {
                        const isLastItem = item.index === items.length - 1;
                        return renderBreadcrumbItem(item, classes.currentItem, navigateToParent, isLastItem);
                    })}

                    <OverflowMenu
                        startDisplayedItems={startDisplayedItems}
                        overflowItems={overflowItems}
                        endDisplayedItems={endDisplayedItems}
                        navigateToParent={navigateToParent}
                    />

                    {endDisplayedItems?.map((item) => {
                        const isLastItem = item.index === items.length - 1;
                        return renderBreadcrumbItem(item, classes.currentItem, navigateToParent, isLastItem);
                    })}
                </Breadcrumb>
            </Overflow>
        </div>
    );
};

interface Item {
    handle: FileSystemHandleUnion;
    lastModified?: Date;
}

class DirectoryTree {
    parents = new Map<FileSystemDirectoryHandle, [string, FileSystemDirectoryHandle]>();

    public findParent(path: string): FileSystemDirectoryHandle | undefined {
        for (const parent of this.parents.values()) {
            const [parentPath, handle] = parent;
            if (parentPath === path) {
                return handle;
            }
        }

        return undefined;
    }

    public getPath(folder: FileSystemDirectoryHandle) {
        const parent = this.parents.get(folder);

        return parent ? `${parent[0]}/${folder.name}` : folder.name;
    }

    public async getEntries(root: FileSystemDirectoryHandle, folder: FileSystemDirectoryHandle) {
        const items: Item[] = [];
        const parent = this.parents.get(folder);

        for await (const [, handle] of folder.entries()) {
            const item: Item = { handle };

            if (handle.kind === 'directory') {
                const parentPath = parent ? `${parent[0]}/${folder.name}` : root.name;
                this.parents.set(handle, [parentPath, folder]);
            }

            if (handle.kind === 'file') {
                if (!handle.name.endsWith('.xivplan')) {
                    continue;
                }

                const file = await handle.getFile();
                item.lastModified = new Date(file.lastModified);
            }

            items.push(item);
        }

        return items;
    }
}

function findSelectedFile(items: Item[], selectedRows: Set<TableRowId>): FileSystemFileHandle | undefined {
    const [id] = selectedRows.values();

    const selectedItem = items.find((item) => {
        return item.handle.name === id;
    });

    return selectedItem?.handle.kind === 'file' ? selectedItem.handle : undefined;
}

function compareItemKinds(a: Item, b: Item) {
    const aKind = getItemkindPriority(a);
    const bKind = getItemkindPriority(b);

    return aKind - bKind;
}

function compareItemNames(a: Item, b: Item) {
    const comp = compareItemKinds(a, b);
    if (comp !== 0) {
        return comp;
    }

    return a.handle.name.localeCompare(b.handle.name, undefined, { numeric: true, sensitivity: 'base' });
}

function compareItemDates(a: Item, b: Item) {
    const getTime = (item: Item) => item.lastModified?.getTime() ?? 0;

    const aTime = getTime(a);
    const bTime = getTime(b);

    if (aTime !== bTime) {
        return aTime - bTime;
    }

    return compareItemNames(a, b);
}

function getItemkindPriority(item: Item) {
    return item.handle.kind === 'directory' ? 1 : 2;
}

function getItemIcon(item: Item) {
    return item.handle.kind === 'directory' ? <FolderFilled /> : <DocumentRegular />;
}

const useStyles = makeStyles({
    fileList: {
        height: `calc(40vh - 2 * (32px - ${tokens.spacingVerticalXS}))`,
        overflow: 'auto',
    },
    topBar: {
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'end',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalXS,
    },

    path: {
        flexGrow: 1,
        background: tokens.colorNeutralBackground6,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalXS,

        width: '550px',
        overflow: 'hidden',
    },

    pathIcon: {
        padding: '6px 0 6px 8px',
    },

    row: {
        userSelect: 'none',
    },

    currentItem: {
        fontWeight: 400,
        color: tokens.colorNeutralForeground1Selected,

        ':hover': {
            color: tokens.colorNeutralForeground1Selected,
        },
    },
});
