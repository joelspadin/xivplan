import {
    Button,
    Checkbox,
    CheckboxProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Divider,
    makeStyles,
    mergeClasses,
    NavDrawer,
    NavDrawerBody,
    NavDrawerProps,
    NavItem,
    NavSectionHeader,
    shorthands,
    tokens,
    typographyStyles,
    useArrowNavigationGroup,
} from '@fluentui/react-components';
import { OptionsFilled } from '@fluentui/react-icons';
import React, { ButtonHTMLAttributes, Dispatch, MouseEventHandler, SetStateAction, useRef, useState } from 'react';
import { useAsync, useCounter, useLocalStorage, useSessionStorage } from 'react-use';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { ARENA_PRESETS } from '../presets/ArenaPresets';
import { ScenePreview } from '../render/SceneRenderer';
import { ArenaPreset, Scene } from '../scene';
import { getRevealedArenaPresets, revealArenaPreset } from '../spoilers';
import { useControlStyles } from '../useControlStyles';
import { ArenaBackgroundEdit } from './ArenaBackgroundEdit';
import { ArenaGridEdit } from './ArenaGridEdit';
import { ArenaShapeEdit } from './ArenaShapeEdit';
import { ArenaTickEdit } from './ArenaTickEdit';

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

const PRESET_CATEGORIES: PresetCategory[] = Object.entries(ARENA_PRESETS).map(([category, inner]) => {
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
});

export const ArenaPanel: React.FC = () => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.column)}>
            <ArenaShapeEdit />
            <ArenaGridEdit />
            <ArenaTickEdit />
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

function getPresetKey(group: string | undefined, name: string) {
    return `${group ?? ''}/${name}`;
}

const SelectPresetButton: React.FC = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(ev, data) => setOpen(data.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button icon={<OptionsFilled />}>Arena presets</Button>
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

    const [counter, { inc: reloadRevealedPresets }] = useCounter();
    const revealedPresets = useAsync(getRevealedArenaPresets, [counter]);
    const [revealAll, setRevealAll] = useLocalStorage<CheckboxProps['checked']>('revealArenaPresets', false);

    const [selectedGroup, setSelectedGroup] = useSessionStorage(
        'arenaPresetGroup',
        PRESET_CATEGORIES[0]?.groups[0]?.value,
    );
    const [selectedPreset, setSelectedPreset] = useState<ArenaPreset>();

    const applyPreset = (preset: ArenaPreset) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...arena } = preset;
        dispatch({ type: 'arena', value: arena });
        setOpen(false);
    };

    const revealPreset = async (key: string) => {
        await revealArenaPreset(key);
        reloadRevealedPresets();
    };

    const presets = getPresetsForGroup(selectedGroup);

    const presetListArrowNav = useArrowNavigationGroup({ axis: 'grid-linear' });

    const presetListRef = useRef<HTMLDivElement>(null);

    const handleItemSelect: NavDrawerProps['onNavItemSelect'] = (e, data) => {
        setSelectedGroup(data.value);
        presetListRef?.current?.focus();
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>Arena presets</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <NavDrawer
                    className={classes.nav}
                    onNavItemSelect={handleItemSelect}
                    selectedValue={selectedGroup}
                    type="inline"
                    tabbable
                    open
                >
                    <NavDrawerBody>
                        {PRESET_CATEGORIES.map((category) => (
                            <React.Fragment key={category.name}>
                                {category.name && (
                                    <NavSectionHeader className={classes.category}>{category.name}</NavSectionHeader>
                                )}

                                {category.groups.map((group) => (
                                    <NavItem key={group.name} value={group.value} className={classes.navItem}>
                                        {group.name}
                                    </NavItem>
                                ))}
                            </React.Fragment>
                        ))}
                    </NavDrawerBody>
                </NavDrawer>

                <div
                    tabIndex={0}
                    role="list"
                    className={classes.presetList}
                    ref={presetListRef}
                    {...presetListArrowNav}
                >
                    {presets?.map((preset) => {
                        const key = getPresetKey(selectedGroup, preset.name);

                        return (
                            <PresetItem
                                key={key}
                                presetKey={key}
                                tabIndex={0}
                                preset={preset}
                                selected={preset === selectedPreset}
                                revealedPresets={revealAll ? [key] : revealedPresets.value}
                                onReveal={() => revealPreset(key)}
                                onSelect={() => setSelectedPreset(preset)}
                                onConfirm={() => applyPreset(preset)}
                            />
                        );
                    })}
                </div>
            </DialogContent>
            <DialogActions fluid className={classes.dialogActions}>
                <Checkbox
                    className={classes.revealAll}
                    checked={revealAll}
                    onChange={(ev, data) => setRevealAll(data.checked)}
                    label="Show all presets"
                />
                <Button
                    appearance="primary"
                    disabled={!selectedPreset}
                    onClick={() => selectedPreset && applyPreset(selectedPreset)}
                >
                    Select preset
                </Button>
                <DialogTrigger disableButtonEnhancement>
                    <Button>Cancel</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

interface PresetItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
    preset: ArenaPreset;
    presetKey: string;
    selected: boolean;
    revealedPresets: readonly string[] | undefined;
    onConfirm: MouseEventHandler<HTMLElement>;
    onReveal: MouseEventHandler<HTMLElement>;
    onSelect: MouseEventHandler<HTMLElement>;
}

const PresetItem: React.FC<PresetItemProps> = ({
    preset,
    presetKey,
    revealedPresets,
    selected,
    onConfirm,
    onReveal,
    onSelect,
    ...props
}) => {
    const classes = useStyles();

    const isSpoiler = !(preset.isSpoilerFree || revealedPresets?.includes(presetKey));

    const handleClick: MouseEventHandler<HTMLElement> = (ev) => {
        if (isSpoiler) {
            onReveal(ev);
        }

        onSelect(ev);
    };

    const handleDoubleClick: MouseEventHandler<HTMLElement> = (ev) => {
        if (isSpoiler) {
            onReveal(ev);
        } else {
            onConfirm(ev);
        }
    };

    const name = isSpoiler ? (preset.spoilerFreeName ?? preset.name) : preset.name;

    const scene: Scene = {
        nextId: 0,
        arena: preset,
        steps: [{ objects: [] }],
    };

    return (
        <button
            role="listitem"
            className={mergeClasses(classes.presetItem, selected && classes.selected)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            {...props}
        >
            <div className={classes.presetHeader}>{name}</div>
            <div className={classes.arenaPreviewWrap}>
                <div className={mergeClasses(classes.arenaPreview, isSpoiler && classes.blur)}>
                    <ScenePreview
                        scene={scene}
                        width={PREVIEW_SIZE}
                        height={PREVIEW_SIZE}
                        backgroundColor="transparent"
                        simple
                    />
                </div>
                {isSpoiler && (
                    <div className={classes.spoilerNotice}>
                        <p>Click to show</p>
                    </div>
                )}
            </div>
        </button>
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

    dialogActions: {
        width: '100%',
    },

    revealAll: {
        marginRight: 'auto',
    },

    nav: {
        minWidth: '200px',
        marginRight: tokens.spacingHorizontalXS,
        overflowY: 'auto',
        background: tokens.colorNeutralBackground1,
    },

    navItem: {
        background: tokens.colorNeutralBackground1,
    },

    category: {
        marginLeft: `calc(-1 * ${tokens.spacingHorizontalMNudge} + 4px)`,
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

        margin: 0,
        padding: 0,

        width: `${PREVIEW_SIZE + 2}px`,
        listStyle: 'none',
        boxSizing: 'border-box',
        border: `${tokens.strokeWidthThin} solid transparent`,
        borderRadius: tokens.borderRadiusLarge,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        backgroundColor: 'transparent',

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

    arenaPreviewWrap: {
        position: 'relative',
    },

    arenaPreview: {
        filter: 'sepia(0) blur(0)',
        transitionProperty: 'filter',
        transitionDuration: tokens.durationUltraFast,
        transitionTimingFunction: tokens.curveEasyEase,
    },

    blur: {
        filter: 'sepia(1) blur(50px)',
    },

    spoilerNotice: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        color: tokens.colorNeutralForegroundStaticInverted,
        textShadow: `0 1px 2px ${tokens.colorNeutralBackgroundStatic}`,
        ...typographyStyles.subtitle2,
    },
});
