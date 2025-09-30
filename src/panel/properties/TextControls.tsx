import { Field } from '@fluentui/react-components';
import {
    SquareHintFilled,
    SquareHintRegular,
    SquareShadowFilled,
    SquareShadowRegular,
    TextAlignCenterFilled,
    TextAlignCenterRegular,
    TextAlignLeftFilled,
    TextAlignLeftRegular,
    TextAlignRightFilled,
    TextAlignRightRegular,
    TextEffectsFilled,
    TextEffectsRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { DeferredTextarea } from '../../DeferredTextarea';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { MIN_FONT_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { TextObject, TextStyle } from '../../scene';
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
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const AlignLeft = bundleIcon(TextAlignLeftFilled, TextAlignLeftRegular);
const AlignCenter = bundleIcon(TextAlignCenterFilled, TextAlignCenterRegular);
const AlignRight = bundleIcon(TextAlignRightFilled, TextAlignRightRegular);

const TextEffects = bundleIcon(TextEffectsFilled, TextEffectsRegular);
const SquareShadow = bundleIcon(SquareShadowFilled, SquareShadowRegular);
const SquareHint = bundleIcon(SquareHintFilled, SquareHintRegular);

export const TextOutlineControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const theme = useSceneTheme();
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const stroke = useMemo(() => commonValue(objects, (obj) => obj.stroke), [objects]);
    const style = useMemo(() => commonValue(objects, (obj) => obj.style), [objects]);

    const handleStrokeChanged = useCallback(
        (stroke: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, stroke })) }),
        [dispatch, objects],
    );

    const handleStyleChanged = useCallback(
        (style: TextStyle) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, style })) });
        },
        [dispatch, objects],
    );

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

    const disabled = style === 'plain';
    const { t } = useTranslation();

    return (
        <>
            <div className={classes.row}>
                <CompactColorPicker
                    label={t('TextControls.Outline')}
                    color={stroke ?? ''}
                    onChange={handleStrokeChanged}
                    className={classes.grow}
                    disabled={disabled}
                />
                <Field label={t('TextControls.Style')}>
                    <SegmentedGroup
                        name="text-style"
                        value={style}
                        onChange={(ev, data) => handleStyleChanged(data.value as TextStyle)}
                    >
                        <Segment value="outline" icon={<TextEffects />} title={t('TextControls.Outline')} />
                        <Segment value="shadow" icon={<SquareShadow />} title={t('TextControls.Shadow')} />
                        <Segment value="plain" icon={<SquareHint />} title={t('TextControls.NoOutline')} />
                    </SegmentedGroup>
                </Field>
            </div>
            {!disabled && (
                <div className={classes.row}>
                    <CompactSwatchColorPicker
                        swatches={swatches}
                        selectedValue={stroke ?? ''}
                        onSelectionChange={(ev, data) => handleStrokeChanged(data.selectedSwatch)}
                    />
                </div>
            )}
        </>
    );
};

export const TextLayoutControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const fontSize = useMemo(() => commonValue(objects, (obj) => obj.fontSize), [objects]);
    const align = useMemo(() => commonValue(objects, (obj) => obj.align), [objects]);

    const onFontSizeChanged = useSpinChanged((fontSize: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fontSize })) }),
    );

    const onAlignChanged = useCallback(
        (align: string) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, align })) });
        },
        [dispatch, objects],
    );
    const { t } = useTranslation();

    return (
        <div className={classes.row}>
            <Field label={t('TextControls.FontSize')}>
                <SpinButton value={fontSize} onChange={onFontSizeChanged} min={MIN_FONT_SIZE} step={5} />
            </Field>
            <Field label="Align">
                <SegmentedGroup name="text-align" value={align} onChange={(ev, data) => onAlignChanged(data.value)}>
                    <Segment value="left" icon={<AlignLeft />} title={t('TextControls.AlignLeft')} />
                    <Segment value="center" icon={<AlignCenter />} title={t('TextControls.AlignCenter')} />
                    <Segment value="right" icon={<AlignRight />} title={t('TextControls.AlignRight')} />
                </SegmentedGroup>
            </Field>
        </div>
    );
};

export const TextValueControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const text = useMemo(() => commonValue(objects, (obj) => obj.text), [objects]);

    const setText = useCallback(
        (text: string) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, text })) });
        },
        [dispatch, objects],
    );
    const { t } = useTranslation();

    // TODO: add autoAdjustHeight once implemented
    return (
        <Field label={t('TextControls.Text')}>
            <DeferredTextarea
                resize="vertical"
                rows={3}
                value={text ?? ''}
                onChange={(ev, data) => setText(data.value)}
            />
        </Field>
    );
};
