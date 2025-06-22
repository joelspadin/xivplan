import React, { useCallback, useMemo } from 'react';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { TextObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import {
    COLOR_BLACK,
    COLOR_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
    makeColorSwatch,
    useSceneTheme,
} from '../../theme';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const OutlineControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const stroke = useMemo(() => commonValue(objects, (obj) => obj.stroke), [objects]);

    const onColorChanged = useCallback(
        (stroke: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, stroke })) }),
        [dispatch, objects],
    );

    return <CompactColorPicker label="Outline" color={stroke ?? ''} onChange={onColorChanged} />;
};

export const OutlineSwatchControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const theme = useSceneTheme();

    const stroke = useMemo(() => commonValue(objects, (obj) => obj.stroke), [objects]);
    const swatches = useMemo(
        () => [
            makeColorSwatch(COLOR_RED, 'red'),
            makeColorSwatch(COLOR_YELLOW, 'yellow'),
            makeColorSwatch(COLOR_GREEN, 'green'),
            makeColorSwatch(COLOR_BLUE, 'blue'),
            makeColorSwatch(COLOR_WHITE, 'white'),
            makeColorSwatch(COLOR_BLACK, 'black'),
            makeColorSwatch(theme.colorArena, 'arena'),
            makeColorSwatch(theme.colorBackground, 'background'),
        ],
        [theme],
    );

    const setColor = useCallback(
        (stroke: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, stroke })) }),
        [dispatch, objects],
    );

    return (
        <CompactSwatchColorPicker
            swatches={swatches}
            selectedValue={stroke ?? ''}
            onSelectionChange={(ev, data) => setColor(data.selectedSwatch)}
        />
    );
};
