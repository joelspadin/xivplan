import { IChoiceGroupOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { DeferredTextField } from '../../DeferredTextField';
import { useScene } from '../../SceneProvider';
import { MIN_FONT_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { TextObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const alignOptions: IChoiceGroupOption[] = [
    { key: 'left', text: 'Align left', iconProps: { iconName: 'AlignLeft' } },
    { key: 'center', text: 'Align center', iconProps: { iconName: 'AlignCenter' } },
    { key: 'right', text: 'Align right', iconProps: { iconName: 'AlignRight' } },
];

export const TextStyleControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const fontSize = useMemo(() => commonValue(objects, (obj) => obj.fontSize), [objects]);
    const align = useMemo(() => commonValue(objects, (obj) => obj.align), [objects]);

    const onFontSizeChanged = useSpinChanged(
        (fontSize: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fontSize })) }),
        [dispatch, objects],
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
        <Stack horizontal tokens={stackTokens}>
            <SpinButton
                label="Font size"
                labelPosition={Position.top}
                value={fontSize?.toString() ?? ''}
                onChange={onFontSizeChanged}
                min={MIN_FONT_SIZE}
                step={5}
            />
            <CompactChoiceGroup
                label="Align"
                selectedKey={align}
                options={alignOptions}
                onChange={(e, option) => onAlignChanged(option?.key)}
            />
        </Stack>
    );
};

export const TextValueControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const text = useMemo(() => commonValue(objects, (obj) => obj.text), [objects]);

    const onTextChanged = useCallback(
        (text: string | undefined) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, text: text ?? '' })) });
        },
        [dispatch, objects],
    );

    return <DeferredTextField label="Text" value={text ?? ''} onChange={onTextChanged} multiline autoAdjustHeight />;
};
