import { DrawTextRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Group, Text, Transformer } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { useScene } from '../SceneProvider';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { ActivePortal } from '../render/Portals';
import { SELECTED_PROPS, useSceneTheme } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { ObjectType, TextObject } from '../scene';
import { useKonvaCache } from '../useKonvaCache';
import { usePanelDrag } from '../usePanelDrag';
import { CompositeReplaceGroup } from './CompositeReplaceGroup';
import { DraggableObject } from './DraggableObject';
import { HideCutoutGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { GroupProps } from './ResizeableObjectContainer';
import { useShowHighlight, useShowResizer } from './highlight';

const DEFAULT_TEXT = 'Text';
const DEFAULT_TEXT_ALIGN = 'center';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_TEXT_OPACITY = 100;
const DEFAULT_FONT_SIZE = 25;

const ICON = <DrawTextRegular />;

export const TextLabel: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Text"
            icon={ICON}
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
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const shapeRef = useRef<Konva.Group>(null);

    useKonvaCache(shapeRef, [cacheKey, object]);

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <TextResizer object={object} nodeRef={shapeRef} dragging={dragging}>
                    {(onTransformEnd) => {
                        return children({
                            ref: shapeRef,
                            onTransformStart: () => setResizing(true),
                            onTransformEnd: (e) => {
                                onTransformEnd(e);
                                setResizing(false);
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

    const [prevSize, setPrevSize] = useState(size);
    const [prevShowHighlight, setPrevShowHighlight] = useState(showHighlight);
    const [prevMeasuredFontSize, setPrevMeasuredFontSize] = useState(measuredFontSize);

    if (size !== prevSize) {
        setPrevSize(size);
        setCacheKey(cacheKey + 1);
    }
    if (showHighlight !== prevShowHighlight) {
        setPrevShowHighlight(showHighlight);
        setCacheKey(cacheKey + 1);
    }
    if (measuredFontSize !== prevMeasuredFontSize) {
        setPrevMeasuredFontSize(measuredFontSize);
        setCacheKey(cacheKey + 1);
    }

    const strokeWidth = Math.max(1, measuredFontSize / 8);

    return (
        <>
            <TextContainer object={object} cacheKey={cacheKey}>
                {(groupProps) => (
                    <Group {...groupProps} offsetX={size.width / 2} offsetY={size.height / 2}>
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

                        <HideCutoutGroup>
                            <CompositeReplaceGroup enabled={showHighlight} opacity={object.opacity / 100}>
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
                            </CompositeReplaceGroup>
                        </HideCutoutGroup>
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

const TextDetails: React.FC<ListComponentProps<TextObject>> = ({ object, ...props }) => {
    return <DetailsItem icon={ICON} name={object.text} object={object} {...props} />;
};

registerListComponent<TextObject>(ObjectType.Text, TextDetails);
