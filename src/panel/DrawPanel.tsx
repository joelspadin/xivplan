import {
    Field,
    ToggleButton,
    ToggleButtonProps,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import {
    CursorClickFilled,
    CursorClickRegular,
    DrawImageFilled,
    DrawImageRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { BrushSizeControl } from '../BrushSizeControl';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { EditMode } from '../editMode';
import '../prefabs/DrawObjectRenderer';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { COLOR_SWATCHES } from '../render/sceneTheme';
import { useControlStyles } from '../useControlStyles';
import { useDrawConfig } from '../useDrawConfig';
import { useEditMode } from '../useEditMode';
import { useHotkeys } from '../useHotkeys';

const CursorClick = bundleIcon(CursorClickFilled, CursorClickRegular);
const DrawImage = bundleIcon(DrawImageFilled, DrawImageRegular);

type ToolButtonPropsGetter = (mode: EditMode) => ToggleButtonProps;

export const DrawPanel: React.FC = () => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const [editMode, setEditMode] = useEditMode();
    const [config, setConfig] = useDrawConfig();

    const setColor = useCallback((color: string) => setConfig({ ...config, color }), [config, setConfig]);

    const setOpacity = useCallback(
        (opacity: number) => {
            if (opacity !== config.opacity) {
                setConfig({ ...config, opacity });
            }
        },
        [config, setConfig],
    );

    const onSizeChanged = useSpinChanged((brushSize: number) => setConfig({ ...config, brushSize }));

    const modeHotkey = useCallback(
        (mode: EditMode) => (e: KeyboardEvent) => {
            setEditMode(mode);
            e.preventDefault();
        },
        [setEditMode],
    );

    useHotkeys('e', {}, modeHotkey(EditMode.Normal), [editMode]);
    useHotkeys('d', {}, modeHotkey(EditMode.Draw), [editMode]);

    const getToolButtonProps = useCallback<ToolButtonPropsGetter>(
        (mode) => {
            const checked = editMode === mode;
            return {
                checked,
                className: mergeClasses(classes.button, checked && classes.checked),
                onClick: () => setEditMode(mode),
            };
        },
        [editMode, classes.button, classes.checked, setEditMode],
    );

    return (
        <div className={mergeClasses(controlClasses.panel, controlClasses.column)}>
            <Field label="Tool">
                <div className={classes.wrapper}>
                    <ToggleButton size="large" icon={<CursorClick />} {...getToolButtonProps(EditMode.Normal)}>
                        Edit
                    </ToggleButton>
                    <ToggleButton size="large" icon={<DrawImage />} {...getToolButtonProps(EditMode.Draw)}>
                        Draw
                    </ToggleButton>
                </div>
            </Field>
            <CompactColorPicker
                label="Color"
                placeholder="Brush color"
                color={config.color}
                onChange={setColor}
                debounceTime={0}
            />
            <CompactSwatchColorPicker
                swatches={COLOR_SWATCHES}
                selectedValue={config.color}
                onSelectionChange={(ev, data) => setColor(data.selectedSwatch)}
            />
            <OpacitySlider value={config.opacity} onChange={(ev, data) => setOpacity(data.value)} />
            <BrushSizeControl
                value={config.brushSize}
                color={config.color}
                opacity={config.opacity}
                onChange={onSizeChanged}
            />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalS,
    },
    button: {
        flex: 1,
    },
    checked: {
        ...shorthands.borderColor(tokens.colorCompoundBrandStroke),

        ':hover': {
            ...shorthands.borderColor(tokens.colorCompoundBrandStrokeHover),
        },

        ':hover:active': {
            ...shorthands.borderColor(tokens.colorCompoundBrandStrokePressed),
        },
    },
});
