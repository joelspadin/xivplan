import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Divider,
    Tree,
    TreeItem,
    TreeItemLayout,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import React, { Dispatch, MouseEventHandler, SetStateAction, useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { ARENA_PRESETS } from '../presets/ArenaPresets';
import { ScenePreview } from '../render/SceneRenderer';
import { ArenaPreset, Scene } from '../scene';
import { useControlStyles } from '../useControlStyles';
import { ArenaBackgroundEdit } from './ArenaBackgroundEdit';
import { ArenaGridEdit } from './ArenaGridEdit';
import { ArenaShapeEdit } from './ArenaShapeEdit';

const PREVIEW_SIZE = 240;

interface PresetGroup {
    value: string;
    name: string;
    presets: ArenaPreset[];
}

interface PresetCategory {
    name: string;
    groups: PresetGroup[];
}

const [GENERAL_PRESETS, ...PRESET_CATEGORIES]: PresetCategory[] = Object.entries(ARENA_PRESETS).map(
    ([category, inner]) => {
        return {
            name: category,
            groups: Object.entries(inner).map(([group, presets]) => {
                return {
                    value: `${category}/${group}`,
                    name: group,
                    presets,
                };
            }),
        };
    },
);

const DEFAULT_OPEN_ITEMS = PRESET_CATEGORIES.map((c) => c.name);

export const ArenaPanel: React.FC = () => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.column)}>
            <ArenaShapeEdit />
            <ArenaGridEdit />
            <ArenaBackgroundEdit />
            <Divider />
            <SelectPresetButton />
        </div>
    );
};

function getPresetsForGroup(value: string | undefined) {
    if (!value) {
        return [];
    }

    const [category, group] = value.split('/');
    return ARENA_PRESETS[category ?? '']?.[group ?? ''] ?? [];
}

const SelectPresetButton: React.FC = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(ev, data) => setOpen(data.open)}>
            <DialogTrigger>
                <Button>Select preset</Button>
            </DialogTrigger>
            <DialogSurface className={classes.dialogSurface}>
                <PresetsDialogBody setOpen={setOpen} />
            </DialogSurface>
        </Dialog>
    );
};

interface PresetsDialogBodyProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const PresetsDialogBody: React.FC<PresetsDialogBodyProps> = ({ setOpen }) => {
    const classes = useStyles();
    const { dispatch } = useScene();

    const [selectedGroup, setSelectedGroup] = useState(GENERAL_PRESETS?.groups[0]?.value);
    const [selectedPreset, setSelectedPreset] = useState<ArenaPreset>();

    const checkedItems = useMemo(() => (selectedGroup ? [selectedGroup] : []), [selectedGroup]);

    const applyPreset = useCallback(
        (preset: ArenaPreset) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { name, ...arena } = preset;
            dispatch({ type: 'arena', value: arena });
            setOpen(false);
        },
        [dispatch, setOpen],
    );

    useHotkeys(
        'enter',
        () => {
            if (selectedPreset) {
                applyPreset(selectedPreset);
            }
        },
        [applyPreset, selectedPreset],
    );

    const getCategoryTreeItems = useCallback(
        (category?: PresetCategory) => {
            return (
                <>
                    {category?.groups.map((group) => (
                        <TreeItem
                            key={group.name}
                            itemType={'leaf'}
                            value={group.value}
                            onClick={() => setSelectedGroup(group.value)}
                            onKeyUp={(ev) => {
                                if (ev.key === 'Enter') {
                                    ev.preventDefault();
                                    setSelectedGroup(group.value);
                                }
                            }}
                        >
                            <TreeItemLayout
                                className={mergeClasses(
                                    classes.treeItem,
                                    classes.treeCommon,
                                    selectedGroup === group.value && classes.treeItemChecked,
                                )}
                                selector={{ className: classes.treeItemSelector }}
                            >
                                {group.name}
                            </TreeItemLayout>
                        </TreeItem>
                    ))}
                </>
            );
        },
        [classes, selectedGroup, setSelectedGroup],
    );

    const presets = getPresetsForGroup(selectedGroup);

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>Arena presets</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <Tree
                    aria-label="arena presets"
                    className={classes.nav}
                    defaultOpenItems={DEFAULT_OPEN_ITEMS}
                    selectionMode="single"
                    checkedItems={checkedItems}
                    onCheckedChange={(ev, data) => setSelectedGroup(data.value as string)}
                >
                    <div className={classes.treeItemGroup}>{getCategoryTreeItems(GENERAL_PRESETS)}</div>
                    {PRESET_CATEGORIES.map((category) => (
                        <TreeItem key={category.name} itemType="branch" value={category.name}>
                            <TreeItemLayout
                                className={mergeClasses(classes.treeItemGroupHeader, classes.treeCommon)}
                                selector={{ className: classes.treeItemSelector }}
                            >
                                {category.name}
                            </TreeItemLayout>
                            <Tree className={classes.treeItemGroup}>{getCategoryTreeItems(category)}</Tree>
                        </TreeItem>
                    ))}
                </Tree>
                <ul className={classes.presetList}>
                    {presets?.map((preset) => (
                        <PresetItem
                            key={preset.name}
                            preset={preset}
                            selected={preset === selectedPreset}
                            onClick={() => setSelectedPreset(preset)}
                            onDoubleClick={() => applyPreset(preset)}
                        />
                    ))}
                </ul>
            </DialogContent>
            <DialogActions>
                <Button
                    appearance="primary"
                    disabled={!selectedPreset}
                    onClick={() => selectedPreset && applyPreset(selectedPreset)}
                >
                    Select preset
                </Button>
                <DialogTrigger>
                    <Button>Cancel</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

interface PresetItemProps {
    preset: ArenaPreset;
    selected: boolean;
    onClick: MouseEventHandler<HTMLElement>;
    onDoubleClick: MouseEventHandler<HTMLElement>;
}

const PresetItem: React.FC<PresetItemProps> = ({ preset, selected, onClick, onDoubleClick }) => {
    const classes = useStyles();

    const scene: Scene = {
        nextId: 0,
        arena: preset,
        steps: [{ objects: [] }],
    };

    return (
        <li
            className={mergeClasses(classes.presetItem, selected && classes.selected)}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <div className={classes.presetHeader}>{preset.name}</div>
            <ScenePreview scene={scene} width={PREVIEW_SIZE} height={PREVIEW_SIZE} />
        </li>
    );
};

const useStyles = makeStyles({
    dialogSurface: {
        maxWidth: '1080px',

        '@media (max-width: 1200px)': {
            maxWidth: '800px',
        },

        '@media (max-width: 900px)': {
            maxWidth: 'calc(100% - 50px)',
        },
    },

    dialogContent: {
        display: 'flex',
        flexFlow: 'row',

        height: '80vh',
        paddingBottom: tokens.spacingVerticalS,
    },

    nav: {
        minWidth: '200px',
        marginRight: tokens.spacingHorizontalXS,
        overflowY: 'auto',
    },

    treeItemSelector: {
        display: 'none',
    },

    treeCommon: {
        borderRadius: tokens.borderRadiusMedium,
        userSelect: 'none',
    },

    treeItem: {
        paddingLeft: tokens.spacingHorizontalXXL,

        ':hover': {
            background: tokens.colorNeutralBackground1Hover,
        },

        ':hover:active': {
            background: tokens.colorNeutralBackground1Pressed,
        },
    },

    treeItemChecked: {
        background: tokens.colorNeutralBackground1Selected,

        position: 'relative',

        '::after': {
            content: '""',

            position: 'absolute',
            left: '2px',
            width: '4px',
            top: '4px',
            bottom: '4px',

            background: tokens.colorCompoundBrandForeground1,
            borderRadius: tokens.borderRadiusSmall,
        },
    },

    treeItemGroup: {
        marginBottom: tokens.spacingVerticalL,
    },

    treeItemGroupHeader: {
        ...typographyStyles.subtitle2Stronger,
        userSelect: 'none',
    },

    presetList: {
        margin: 0,
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,

        overflowY: 'auto',
        display: 'flex',
        flexFlow: 'row wrap',
        alignItems: 'start',
        alignContent: 'start',
        justifyContent: 'start',

        width: '100%',
        gap: '20px',

        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusLarge,
    },

    presetItem: {
        display: 'flex',
        flexFlow: 'column',

        width: `${PREVIEW_SIZE + 2}px`,
        listStyle: 'none',
        boxSizing: 'border-box',
        border: `${tokens.strokeWidthThin} solid transparent`,
        borderRadius: tokens.borderRadiusLarge,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        ':hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorSubtleBackgroundPressed,
        },
    },
    selected: {
        ...shorthands.borderColor(tokens.colorNeutralForeground2BrandSelected),
        backgroundColor: tokens.colorSubtleBackgroundSelected,
        boxShadow: tokens.shadow4,
    },
    presetHeader: {
        textAlign: 'center',
        marginTop: tokens.spacingVerticalS,
        marginBottom: '-10px',
        paddingInlineStart: tokens.spacingHorizontalS,
        paddingInlineEnd: tokens.spacingHorizontalS,
        ...typographyStyles.body2,
    },
});
