import {
    classNamesFunction,
    DefaultButton,
    DialogFooter,
    IModalProps,
    IModalStyles,
    INavLinkGroup,
    IStackTokens,
    IStyle,
    IStyleFunction,
    IStyleFunctionOrObject,
    mergeStyleSets,
    Nav,
    PrimaryButton,
    Separator,
    Stack,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { MouseEventHandler, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { ScenePreview } from '../render/SceneRenderer';
import { ArenaPreset, Scene } from '../scene';
import { useScene } from '../SceneProvider';
import { ArenaBackgroundEdit } from './ArenaBackgroundEdit';
import { ArenaGridEdit } from './ArenaGridEdit';
import { ARENA_PRESETS } from './ArenaPresets';
import { ArenaShapeEdit } from './ArenaShapeEdit';
import { PANEL_PADDING } from './PanelStyles';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const classNames = mergeStyleSets({
    panel: {
        padding: PANEL_PADDING,
    } as IStyle,
    list: {
        padding: 0,
        overflow: 'auto',
        display: 'flex',
        flexFlow: 'row wrap',
        maxHeight: 'calc(80vh - 80px)',
        gap: '20px',
    } as IStyle,
});

export const ArenaPanel: React.FC = () => {
    return (
        <Stack className={classNames.panel} tokens={stackTokens}>
            <ArenaShapeEdit />
            <ArenaGridEdit />
            <ArenaBackgroundEdit />
            <Separator />
            <SelectPresetButton />
        </Stack>
    );
};

const SelectPresetButton: React.FC = () => {
    const [isOpen, { setTrue: showDialog, setFalse: hideDialog }] = useBoolean(false);

    return (
        <>
            <DefaultButton text="Select preset" onClick={showDialog} />
            <SelectPresetDialog isOpen={isOpen} onDismiss={hideDialog} />
        </>
    );
};

const navLinkGroups: INavLinkGroup[] = [
    {
        links: Object.keys(ARENA_PRESETS).map((category) => {
            return {
                name: category,
                url: '#',
                key: category,
            };
        }),
    },
];

const PREVIEW_SIZE = 240;

const SelectPresetDialog: React.FC<IModalProps> = (props) => {
    const { dispatch } = useScene();
    const [category, setCategory] = useState('General');
    const [selected, setSelected] = useState<ArenaPreset>();

    const applyPreset = useCallback(
        (preset: ArenaPreset) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { name, ...arena } = preset;
            dispatch({ type: 'arena', value: arena });
            props.onDismiss?.();
        },
        [dispatch, props],
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

    const categoryPresets = ARENA_PRESETS[category] ?? [];

    return (
        <BaseDialog headerText="Arena preset" {...props} dialogStyles={dialogStyles} styles={modalStyles}>
            <Stack horizontal tokens={{ childrenGap: 20 }}>
                <Nav
                    groups={navLinkGroups}
                    selectedKey={category}
                    onLinkClick={(ev, item) => {
                        if (item) {
                            setCategory(item.name);
                            setSelected(undefined);
                        }
                    }}
                />
                <div>
                    <ul className={classNames.list}>
                        {categoryPresets.map((preset) => (
                            <PresetItem
                                key={preset.name}
                                preset={preset}
                                selected={preset === selected}
                                onClick={() => setSelected(preset)}
                                onDoubleClick={() => applyPreset(preset)}
                            />
                        ))}
                    </ul>
                </div>
            </Stack>
            <DialogFooter>
                <PrimaryButton
                    text="Select preset"
                    disabled={!selected}
                    onClick={() => selected && applyPreset(selected)}
                />
                <DefaultButton text="Cancel" onClick={() => props.onDismiss?.()} />
            </DialogFooter>
        </BaseDialog>
    );
};

const modalStyles: Partial<IModalStyles> = {
    root: {
        paddingTop: 40,
        alignItems: 'start',
    },
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        width: 1000,

        '@media (max-width: 1200px)': {
            width: 800,
        } as IStyle,

        '@media (max-width: 900px)': {
            width: 'calc(100% - 50px)',
        } as IStyle,
    },
};

interface IPresetStyles {
    item: IStyle;
    selected: IStyle;
    header: IStyle;
}

const getPresetClassNames = classNamesFunction<Theme, IPresetStyles>();

const getPresetStyles: IStyleFunction<Theme, IPresetStyles> = (theme) => {
    return {
        item: {
            width: PREVIEW_SIZE + 2,
            listStyle: 'none',
            boxSizing: 'border-box',
            border: '1px solid transparent',
        },
        selected: {
            borderColor: theme.palette.themePrimary,
        },
        header: {
            marginBottom: -10,
            paddingInlineStart: theme.spacing.s1,
            paddingInlineEnd: theme.spacing.s1,
            ...theme.fonts.mediumPlus,
        },
    };
};

interface PresetItemProps {
    preset: ArenaPreset;
    selected: boolean;
    onClick: MouseEventHandler<HTMLElement>;
    onDoubleClick: MouseEventHandler<HTMLElement>;
}

const PresetItem: React.FC<PresetItemProps> = ({ preset, selected, onClick, onDoubleClick }) => {
    const theme = useTheme();
    const classNames = getPresetClassNames(getPresetStyles, theme);

    const className = `${classNames.item} ${selected ? classNames.selected : ''}`;

    const scene: Scene = {
        nextId: 0,
        arena: preset,
        steps: [{ objects: [] }],
    };

    return (
        <li className={className} onClick={onClick} onDoubleClick={onDoubleClick}>
            <Stack>
                <div className={classNames.header}>{preset.name}</div>
                <ScenePreview scene={scene} width={PREVIEW_SIZE} height={PREVIEW_SIZE} />
            </Stack>
        </li>
    );
};
