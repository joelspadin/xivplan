import React from 'react';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { ColoredObject, isMarker } from '../../scene';
import { useScene } from '../../SceneProvider';
import {
    COLOR_MARKER_BLUE,
    COLOR_MARKER_PURPLE,
    COLOR_MARKER_RED,
    COLOR_MARKER_YELLOW,
    makeColorSwatch,
    useColorSwatches,
} from '../../theme';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ColorControl: React.FC<PropertiesControlProps<ColoredObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const color = commonValue(objects, (obj) => obj.color);

    const onColorChanged = (color: string, transient: boolean) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })), transient });

    return (
        <CompactColorPicker
            label="Color"
            color={color ?? ''}
            onChange={(data) => onColorChanged(data.value, data.transient)}
            onCommit={() => dispatch({ type: 'commit' })}
        />
    );
};

const MARKER_SWATCHES = [
    makeColorSwatch(COLOR_MARKER_RED, 'red'),
    makeColorSwatch(COLOR_MARKER_YELLOW, 'yellow'),
    makeColorSwatch(COLOR_MARKER_BLUE, 'blue'),
    makeColorSwatch(COLOR_MARKER_PURPLE, 'purple'),
];

export const ColorSwatchControl: React.FC<PropertiesControlProps<ColoredObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const colorSwatches = useColorSwatches();

    const color = commonValue(objects, (obj) => obj.color);
    const swatches = objects.every(isMarker) ? MARKER_SWATCHES : colorSwatches;

    const setColor = (color: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })) });

    return (
        <CompactSwatchColorPicker
            swatches={swatches}
            selectedValue={color ?? ''}
            onSelectionChange={(ev, data) => setColor(data.selectedSwatch)}
        />
    );
};
