import { IChoiceGroupOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import Konva from 'konva';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Text, Transformer } from 'react-konva';
import icon from '../assets/marker/text.png';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
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
import { SpinButtonUnits } from '../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from './CommonProperties';
import { DraggableObject } from './DraggableObject';
import { useShowHighlight, useShowResizer } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { GroupProps } from './ResizeableObjectContainer';

const DEFAULT_TEXT = 'Text';
const DEFAULT_TEXT_ALIGN = 'center';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_TEXT_OPACITY = 100;
const DEFAULT_FONT_SIZE = 25;
const MIN_FONT_SIZE = 15;

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

function lineCount(text: string) {
    return text.split('\n').length;
}

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

interface TextResizerProps {
    index: number;
    object: TextObject;
    nodeRef: RefObject<Konva.Group>;
    dragging?: boolean;
    children: (onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void) => React.ReactElement;
}

const SNAP_ANGLE = 45;
const ROTATION_SNAPS = Array.from({ length: 360 / SNAP_ANGLE }).map((_, i) => i * SNAP_ANGLE);

const TextResizer: React.VFC<TextResizerProps> = ({ object, index, nodeRef, dragging, children }) => {
    const [scene, dispatch] = useScene();
    const showResizer = useShowResizer(object, index);
    const trRef = useRef<Konva.Transformer>(null);

    const minHeight = useMemo(() => MIN_FONT_SIZE * LINE_HEIGHT * lineCount(object.text), [object.text]);

    useEffect(() => {
        if (showResizer && trRef.current && nodeRef.current) {
            trRef.current.nodes([nodeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [showResizer, nodeRef, trRef]);

    const onTransformEnd = useCallback(() => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }

        const newProps: Partial<TextObject> = {
            rotation: Math.round(node.rotation()),
        };

        dispatch({ type: 'update', index, value: { ...object, ...newProps } });
    }, [index, object, minHeight, scene, dispatch, nodeRef]);

    return (
        <>
            {children(onTransformEnd)}
            {showResizer && (
                <ActivePortal isActive>
                    <Transformer
                        ref={trRef}
                        visible={!dragging}
                        centeredScaling
                        resizeEnabled={false}
                        rotationSnaps={ROTATION_SNAPS}
                    />
                </ActivePortal>
            )}
        </>
    );
};

interface TextContainerProps {
    index: number;
    object: TextObject;
    cacheKey?: unknown;
    children: (groupProps: GroupProps) => React.ReactElement;
}

const TextContainer: React.VFC<TextContainerProps> = ({ index, object, cacheKey, children }) => {
    const [resizing, { setTrue: startResizing, setFalse: stopResizing }] = useBoolean(false);
    const [dragging, setDragging] = useState(false);
    const shapeRef = useRef<Konva.Group>(null);

    useEffect(() => {
        shapeRef.current?.cache();
    }, [cacheKey, shapeRef, object, index]);

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} index={index} onActive={setDragging}>
                <TextResizer object={object} index={index} nodeRef={shapeRef} dragging={dragging}>
                    {(onTransformEnd) => {
                        return children({
                            ref: shapeRef,
                            onTransformStart: startResizing,
                            onTransformEnd: (e) => {
                                onTransformEnd(e);
                                stopResizing();
                            },
                            rotation: object.rotation,
                        });
                    }}
                </TextResizer>
            </DraggableObject>
        </ActivePortal>
    );
};

const TextRenderer: React.FC<RendererProps<TextObject>> = ({ object, index }) => {
    const theme = useSceneTheme();
    const showHighlight = useShowHighlight(object, index);

    const [measuredFontSize, setMeasuredFontSize] = useState(object.fontSize);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [cacheKey, setCacheKey] = useState(0);

    const textRef = useRef<Konva.Text>(null);
    useEffect(() => {
        if (textRef.current) {
            setSize(measureText(textRef.current, object.text, object.fontSize, LINE_HEIGHT));
            setMeasuredFontSize(object.fontSize);
        }
    }, [textRef, object.text, object.fontSize]);

    useEffect(() => {
        setCacheKey(cacheKey + 1);
    }, [textRef.current, showHighlight, size, measuredFontSize]);

    const strokeWidth = Math.max(1, measuredFontSize / 8);

    return (
        <>
            <TextContainer object={object} index={index} cacheKey={cacheKey}>
                {(groupProps) => (
                    <Group
                        {...groupProps}
                        offsetX={size.width / 2}
                        offsetY={size.height / 2}
                        opacity={object.opacity / 100}
                    >
                        {showHighlight && (
                            <Text
                                text={object.text}
                                width={size.width}
                                height={size.height}
                                align={object.align}
                                verticalAlign="middle"
                                fontSize={measuredFontSize}
                                lineHeight={LINE_HEIGHT}
                                {...SELECTED_PROPS}
                                strokeWidth={strokeWidth}
                            />
                        )}

                        <Text
                            text={object.text}
                            width={size.width}
                            height={size.height}
                            align={object.align}
                            verticalAlign="middle"
                            fontSize={measuredFontSize}
                            lineHeight={LINE_HEIGHT}
                            fill={object.color}
                            stroke={theme.arena.fill}
                            strokeWidth={strokeWidth}
                            fillAfterStrokeEnabled
                        />
                    </Group>
                )}
            </TextContainer>

            {/*
            Hack to avoid flickering when increasing font size: measure the text
            using a hidden text element, but don't update the font size of the
            visible text until the measurement is done.
            */}
            <Text visible={false} ref={textRef} text={object.text} fontSize={object.fontSize} />
        </>
    );
};

registerRenderer<TextObject>(ObjectType.Text, LayerName.Foreground, TextRenderer);

const TextDetails: React.FC<ListComponentProps<TextObject>> = ({ object, index }) => {
    return <DetailsItem icon={icon} name={object.text} index={index} />;
};

registerListComponent<TextObject>(ObjectType.Text, TextDetails);

const TEXT_COLOR_SWATCHES = [DEFAULT_TEXT_COLOR, '#000000', '#ff0000', '#00e622', '#ffc800'];

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const alignOptions: IChoiceGroupOption[] = [
    { key: 'left', text: 'Align left', iconProps: { iconName: 'AlignLeft' } },
    { key: 'center', text: 'Align center', iconProps: { iconName: 'AlignCenter' } },
    { key: 'right', text: 'Align right', iconProps: { iconName: 'AlignRight' } },
];

const TextEditControl: React.FC<PropertiesControlProps<TextObject>> = ({ object, index }) => {
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
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={TEXT_COLOR_SWATCHES} onChange={onColorChanged} />

            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <Stack horizontal tokens={stackTokens}>
                <SpinButton
                    label="Font size"
                    labelPosition={Position.top}
                    value={object.fontSize.toString()}
                    onChange={onFontSizeChanged}
                    min={MIN_FONT_SIZE}
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

registerPropertiesControl<TextObject>(ObjectType.Text, TextEditControl);
