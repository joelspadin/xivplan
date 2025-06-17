import React, { useCallback, useMemo } from 'react';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { useScene } from '../../SceneProvider';
import {
    COLOR_MARKER_BLUE,
    COLOR_MARKER_PURPLE,
    COLOR_MARKER_RED,
    COLOR_MARKER_YELLOW,
    COLOR_SWATCHES,
    makeColorSwatch,
} from '../../render/sceneTheme';
import { ColoredObject, isMarker } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ColorControl: React.FC<PropertiesControlProps<ColoredObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const color = useMemo(() => commonValue(objects, (obj) => obj.color), [objects]);

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })) }),
        [dispatch, objects],
    );

    return (
        <CompactColorPicker label="Color" placeholder="Object color" color={color ?? ''} onChange={onColorChanged} />
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

    const color = useMemo(() => commonValue(objects, (obj) => obj.color), [objects]);
    const swatches = useMemo(() => {
        if (objects.every(isMarker)) {
            return MARKER_SWATCHES;
        }

        return COLOR_SWATCHES;
    }, [objects]);

    const setColor = useCallback(
        (color: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })) }),
        [dispatch, objects],
    );

    return (
        <CompactSwatchColorPicker
            swatches={swatches}
            selectedValue={color ?? ''}
            onSelectionChange={(ev, data) => setColor(data.selectedSwatch)}
        />
    );
};
