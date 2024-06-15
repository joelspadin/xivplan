import { INavLink, INavLinkGroup, Nav } from '@fluentui/react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Divider,
    makeStyles,
    mergeClasses,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import React, { MouseEventHandler, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useScene } from '../SceneProvider';
import { ARENA_PRESETS } from '../presets/ArenaPresets';
import { ScenePreview } from '../render/SceneRenderer';
import { ArenaPreset, Scene } from '../scene';
import { ArenaBackgroundEdit } from './ArenaBackgroundEdit';
import { ArenaGridEdit } from './ArenaGridEdit';
import { ArenaShapeEdit } from './ArenaShapeEdit';
import { PANEL_PADDING } from './PanelStyles';

export const ArenaPanel: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.panel}>
            <ArenaShapeEdit />
            <ArenaGridEdit />
            <ArenaBackgroundEdit />
            <Divider />
            <SelectPresetButton />
        </div>
    );
};

const KeySep = '#';

function presetsToLinks(category: string, presets: Record<string, ArenaPreset[]>): INavLink[] {
    return Object.keys(presets).map((key) => {
        return { name: key, url: '', key: `${category}${KeySep}${key}` };
    });
}

function getPresetsForKey(key: string | undefined) {
    const [key1, key2] = key?.split(KeySep) ?? [];
    return ARENA_PRESETS[key1 ?? '']?.[key2 ?? ''] ?? [];
}

// TODO: migrate to Tree or wait for Nav component to be implement in v9
// https://github.com/orgs/microsoft/projects/786/views/1?pane=issue&itemId=24403433
const navLinkGroups: INavLinkGroup[] = [
    ...Object.entries(ARENA_PRESETS).map(([key, value]) => {
        return {
            name: key,
            links: presetsToLinks(key, value),
        } as INavLinkGroup;
    }),
];

const PREVIEW_SIZE = 240;

const SelectPresetButton: React.FC = () => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState(navLinkGroups[0]?.links[0]?.key);
    const [selected, setSelected] = useState<ArenaPreset>();

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
            if (selected) {
                applyPreset(selected);
            }
        },
        [applyPreset, selected],
    );

    const presets = getPresetsForKey(key);

    return (
        <Dialog open={open} onOpenChange={(ev, data) => setOpen(data.open)}>
            <DialogTrigger>
                <Button>Select preset</Button>
            </DialogTrigger>
            <DialogSurface className={classes.dialogSurface}>
                <DialogBody>
                    <DialogTitle>Arena presets</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <div className={classes.nav}>
                            <Nav
                                groups={navLinkGroups}
                                selectedKey={key}
                                onLinkClick={(ev, item) => {
                                    if (item) {
                                        if (item.links) {
                                            return;
                                        }

                                        setKey(item.key);
                                        setSelected(undefined);
                                    }
                                }}
                            />
                        </div>
                        <ul className={classes.presetList}>
                            {presets?.map((preset) => (
                                <PresetItem
                                    key={preset.name}
                                    preset={preset}
                                    selected={preset === selected}
                                    onClick={() => setSelected(preset)}
                                    onDoubleClick={() => applyPreset(preset)}
                                />
                            ))}
                        </ul>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="primary"
                            disabled={!selected}
                            onClick={() => selected && applyPreset(selected)}
                        >
                            Select preset
                        </Button>
                        <DialogTrigger>
                            <Button>Cancel</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
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
    panel: {
        display: 'flex',
        flexFlow: 'column',
        rowGap: tokens.spacingVerticalM,
        padding: `${PANEL_PADDING}px`,
    },

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
        paddingBottom: tokens.spacingVerticalL,
    },

    nav: {
        minWidth: '200px',
        marginRight: tokens.spacingHorizontalXS,
        overflowY: 'auto',
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
        backgroundColor: tokens.colorSubtleBackgroundSelected,
        // TODO: should be able to just set backgroundColor here, but its type is "undefined"?
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralForeground2BrandSelected}`,
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
