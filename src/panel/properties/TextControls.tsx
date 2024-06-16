import { IChoiceGroupOption } from '@fluentui/react';
import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { DeferredTextarea } from '../../DeferredTextarea';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MIN_FONT_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { TextObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const alignOptions: IChoiceGroupOption[] = [
    { key: 'left', text: 'Align left', iconProps: { iconName: 'AlignLeft' } },
    { key: 'center', text: 'Align center', iconProps: { iconName: 'AlignCenter' } },
    { key: 'right', text: 'Align right', iconProps: { iconName: 'AlignRight' } },
];

export const TextStyleControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const fontSize = useMemo(() => commonValue(objects, (obj) => obj.fontSize), [objects]);
    const align = useMemo(() => commonValue(objects, (obj) => obj.align), [objects]);

    const onFontSizeChanged = useSpinChanged((fontSize: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fontSize })) }),
    );

    const onAlignChanged = useCallback(
        (align: string | undefined) => {
            if (align) {
                dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, align })) });
            }
        },
        [dispatch, objects],
    );

    return (
        <div className={classes.row}>
            <Field label="Font size">
                <SpinButton value={fontSize} onChange={onFontSizeChanged} min={MIN_FONT_SIZE} step={5} />
            </Field>
            <Field label="Align">
                <CompactChoiceGroup
                    selectedKey={align}
                    options={alignOptions}
                    onChange={(e, option) => onAlignChanged(option?.key)}
                />
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

    // TODO: add autoAdjustHeight once implemented
    return (
        <Field label="Text">
            <DeferredTextarea
                resize="vertical"
                rows={3}
                value={text ?? ''}
                onChange={(ev, data) => setText(data.value)}
            />
        </Field>
    );
};
