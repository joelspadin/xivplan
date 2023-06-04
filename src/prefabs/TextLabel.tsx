import { useBoolean } from '@fluentui/react-hooks';
import Konva from 'konva';
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Group, Text, Transformer } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { useScene } from '../SceneProvider';
import icon from '../assets/marker/text.png';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { ActivePortal } from '../render/Portals';
import { SELECTED_PROPS, useSceneTheme } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { ObjectType, TextObject } from '../scene';
import { usePanelDrag } from '../usePanelDrag';
import { DraggableObject } from './DraggableObject';
import { PrefabIcon } from './PrefabIcon';
import { GroupProps } from './ResizeableObjectContainer';
import { useShowHighlight, useShowResizer } from './highlight';

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

// function lineCount(text: string) {
//     return text.split('\n').length;
// }

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
    object: TextObject;
    nodeRef: RefObject<Konva.Group>;
    dragging?: boolean;
    children: (onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void) => React.ReactElement;
}

const SNAP_ANGLE = 45;
const ROTATION_SNAPS = Array.from({ length: 360 / SNAP_ANGLE }).map((_, i) => i * SNAP_ANGLE);

const TextResizer: React.FC<TextResizerProps> = ({ object, nodeRef, dragging, children }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const trRef = useRef<Konva.Transformer>(null);

    // const minHeight = useMemo(() => MIN_FONT_SIZE * LINE_HEIGHT * lineCount(object.text), [object.text]);

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

        dispatch({ type: 'update', value: { ...object, ...newProps } });
    }, [object, dispatch, nodeRef]);

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
    object: TextObject;
    cacheKey?: unknown;
    children: (groupProps: GroupProps) => React.ReactElement;
}

const TextContainer: React.FC<TextContainerProps> = ({ object, cacheKey, children }) => {
    const [resizing, { setTrue: startResizing, setFalse: stopResizing }] = useBoolean(false);
    const [dragging, setDragging] = useState(false);
    const shapeRef = useRef<Konva.Group>(null);

    useEffect(() => {
        shapeRef.current?.cache();
    }, [cacheKey, shapeRef, object]);

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <TextResizer object={object} nodeRef={shapeRef} dragging={dragging}>
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

const TextRenderer: React.FC<RendererProps<TextObject>> = ({ object }) => {
    const theme = useSceneTheme();
    const showHighlight = useShowHighlight(object);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textRef, showHighlight, size, measuredFontSize]);

    const strokeWidth = Math.max(1, measuredFontSize / 8);

    return (
        <>
            <TextContainer object={object} cacheKey={cacheKey}>
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

const TextDetails: React.FC<ListComponentProps<TextObject>> = ({ object, isNested }) => {
    return <DetailsItem icon={icon} name={object.text} object={object} isNested={isNested} />;
};

registerListComponent<TextObject>(ObjectType.Text, TextDetails);
