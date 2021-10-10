import { IChoiceGroupOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import Konva from 'konva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-konva';
import icon from '../assets/marker/text.png';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { CompactColorPicker } from '../CompactColorPicker';
import { DeferredTextField } from '../DeferredTextField';
import { OpacitySlider } from '../OpacitySlider';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { ActivePortal } from '../render/Portals';
import { SELECTED_PROPS, useSceneTheme } from '../render/SceneTheme';
import { ObjectType, SceneObject, TextObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsSelected } from '../SelectionProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from './CommonProperties';
import { DraggableObject } from './DraggableObject';
import { PrefabIcon } from './PrefabIcon';

const DEFAULT_TEXT = 'Text';
const DEFAULT_TEXT_ALIGN = 'center';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_TEXT_OPACITY = 100;
const DEFAULT_FONT_SIZE = 25;

export const TextLabel: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Text"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Text,
                        text: DEFAULT_TEXT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<TextObject>(ObjectType.Text, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Text,
            align: DEFAULT_TEXT_ALIGN,
            fontSize: DEFAULT_FONT_SIZE,
            color: DEFAULT_TEXT_COLOR,
            opacity: DEFAULT_TEXT_OPACITY,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const LINE_HEIGHT = 1.2;

function measureText(
    node: Konva.Text,
    text: string,
    fontSize: number,
    lineHeight: number,
): { width: number; height: number } {
    const lines = text.split('\n');
    const width = lines.reduce((width, line) => Math.max(width, node.measureSize(line).width), 0);
    const height = fontSize * lineHeight * lines.length;

    return { width, height };
}

const RectangleRenderer: React.FC<RendererProps<TextObject>> = ({ object, index }) => {
    const theme = useSceneTheme();
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);

    const [measuredFontSize, setMeasuredFontSize] = useState(object.fontSize);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const textRef = useRef<Konva.Text>(null);
    useEffect(() => {
        if (textRef.current) {
            setSize(measureText(textRef.current, object.text, object.fontSize, LINE_HEIGHT));
            setMeasuredFontSize(object.fontSize);
        }
    }, [textRef, object.text, object.fontSize]);

    const strokeWidth = Math.max(1, object.fontSize / 8);

    return (
        <>
            <ActivePortal isActive={active}>
                <DraggableObject object={object} index={index} onActive={setActive}>
                    {isSelected && (
                        <Text
                            text={object.text}
                            width={size.width}
                            height={size.height}
                            offsetX={size.width / 2}
                            offsetY={size.height / 2}
                            rotation={object.rotation}
                            align={object.align}
                            verticalAlign="middle"
                            fontSize={measuredFontSize}
                            lineHeight={LINE_HEIGHT}
                            opacity={object.opacity / 100}
                            {...SELECTED_PROPS}
                            strokeWidth={strokeWidth}
                        />
                    )}

                    <Text
                        text={object.text}
                        width={size.width}
                        height={size.height}
                        offsetX={size.width / 2}
                        offsetY={size.height / 2}
                        rotation={object.rotation}
                        align={object.align}
                        verticalAlign="middle"
                        fontSize={measuredFontSize}
                        lineHeight={LINE_HEIGHT}
                        opacity={object.opacity / 100}
                        fill={object.color}
                        stroke={theme.arena.fill}
                        strokeWidth={strokeWidth}
                        fillAfterStrokeEnabled
                    />
                </DraggableObject>
            </ActivePortal>

            {/*
            Hack to avoid flickering when increasing font size: measure the text
            using a hidden text element, but don't update the font size of the
            visible text until the measurement is done.
            */}
            <Text visible={false} ref={textRef} text={object.text} fontSize={object.fontSize} />
        </>
    );
};

registerRenderer<TextObject>(ObjectType.Text, LayerName.Foreground, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<TextObject>> = ({ object, index }) => {
    return <DetailsItem icon={icon} name={object.text} index={index} />;
};

registerListComponent<TextObject>(ObjectType.Text, RectangleDetails);

const TEXT_COLOR_SWATCHES = [DEFAULT_TEXT_COLOR, '#000000', '#ff0000', '#00e622', '#ffc800'];

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const alignOptions: IChoiceGroupOption[] = [
    { key: 'left', text: 'Align left', iconProps: { iconName: 'AlignLeft' } },
    { key: 'center', text: 'Align center', iconProps: { iconName: 'AlignCenter' } },
    { key: 'right', text: 'Align right', iconProps: { iconName: 'AlignRight' } },
];

const RectangleEditControl: React.FC<PropertiesControlProps<TextObject>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', index, value: { ...object, opacity } });
            }
        },
        [dispatch, object, index],
    );

    const onFontSizeChanged = useSpinChanged(
        (fontSize: number) => dispatch({ type: 'update', index, value: { ...object, fontSize } as SceneObject }),
        [dispatch, object, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) =>
            dispatch({ type: 'update', index, value: { ...object, rotation: rotation % 360 } as SceneObject }),
        [dispatch, object, index],
    );

    const onAlignChanged = useCallback(
        (align: string) => dispatch({ type: 'update', index, value: { ...object, align } }),
        [dispatch, object, index],
    );

    const onTextChanged = useCallback(
        (text?: string) => dispatch({ type: 'update', index, value: { ...object, text: text ?? '' } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item grow>
                    <CompactColorPicker
                        label="Color"
                        color={object.color}
                        swatches={TEXT_COLOR_SWATCHES}
                        onChange={onColorChanged}
                    />
                </Stack.Item>
            </Stack>
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <Stack horizontal tokens={stackTokens}>
                <SpinButton
                    label="Font size"
                    labelPosition={Position.top}
                    value={object.fontSize.toString()}
                    onChange={onFontSizeChanged}
                    min={15}
                    step={5}
                />
                <CompactChoiceGroup
                    label="Align"
                    selectedKey={object.align}
                    options={alignOptions}
                    onChange={(e, option) => onAlignChanged(option?.key || DEFAULT_TEXT_ALIGN)}
                />
            </Stack>
            <MoveableObjectProperties object={object} index={index} />
            <SpinButtonUnits
                label="Rotation"
                labelPosition={Position.top}
                value={object.rotation.toString()}
                onChange={onRotationChanged}
                step={15}
                suffix="°"
            />
            <DeferredTextField label="Text" value={object.text} onChange={onTextChanged} multiline autoAdjustHeight />
        </Stack>
    );
};

registerPropertiesControl<TextObject>(ObjectType.Text, RectangleEditControl);
