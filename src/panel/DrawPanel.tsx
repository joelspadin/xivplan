import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import { mergeClasses } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { BrushSizeControl } from '../BrushSizeControl';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { useHotkeys } from '../HotkeyHelpProvider';
import { OpacitySlider } from '../OpacitySlider';
import { EditMode } from '../editMode';
import '../prefabs/DrawObjectRenderer';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { COLOR_SWATCHES } from '../render/SceneTheme';
import { useControlStyles } from '../useControlStyles';
import { useDrawConfig } from '../useDrawConfig';
import { useEditMode } from '../useEditMode';

const modeOptions: IChoiceGroupOption[] = [
    {
        key: EditMode.Normal,
        text: 'Edit',
        iconProps: { iconName: 'TouchPointer' },
    },
    {
        key: EditMode.Draw,
        text: 'Draw',
        iconProps: { iconName: 'Brush' },
    },
];

export const DrawPanel: React.FC = () => {
    const classes = useControlStyles();
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

    useHotkeys('e', '', '', modeHotkey(EditMode.Normal), [editMode]);
    useHotkeys('d', '', '', modeHotkey(EditMode.Draw), [editMode]);

    return (
        <div className={mergeClasses(classes.panel, classes.column)}>
            {/* TODO: replace with segmented button (after implementing it) */}
            <ChoiceGroup
                label="Tool"
                options={modeOptions}
                selectedKey={editMode}
                onChange={(e, option) => setEditMode(option?.key as EditMode)}
            />
            <CompactColorPicker label="Color" color={config.color} onChange={setColor} debounceTime={0} />
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
