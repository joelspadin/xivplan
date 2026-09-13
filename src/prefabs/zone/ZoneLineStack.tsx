import { useDebouncedEffect } from '@react-hookz/web';
import Konva from 'konva';
import type { RectConfig } from 'konva/lib/shapes/Rect';
import React, { useRef, useState } from 'react';
import { Circle, Group, Rect } from 'react-konva';
import { registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/line_stack.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { type LineStackZone, ObjectType, type RectangleZone } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { useObjectLoading } from '../../useObjectLoading';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../bounds';
import { useHighlightProps, useOverrideProps } from '../highlight';
import { createLineShapeContainer, type LineShapeRendererProps } from '../lines';
import { ChevronTail, type ChevronWithTailConfig } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const NAME = 'Line stack';

const DEFAULT_WIDTH = 100;
const DEFAULT_LENGTH = 250;

export const ZoneLineStack: React.FC = () => {
    return (
        <PrefabIcon
            name={NAME}
            icon={<Icon />}
            object={{
                type: ObjectType.LineStack,
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineStack, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.LineStack,
            width: DEFAULT_WIDTH,
            length: DEFAULT_LENGTH,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const OFFSCREEN_X = -10000;
const OFFSCREEN_Y = -10000;
const MIN_REDRAW_MS = 20;
const MAX_REDRAW_MS = 250;

const CHEVRON_ANGLE = 40;

const ARROW_SIZE_FRAC = 0.3;
const ARROW_THICKNESS_FRAC = 0.28;
const ARROW_PAD = 0.32;

const LineStackRenderer: React.FC<LineShapeRendererProps<LineStackZone>> = ({
    object,
    length,
    width,
    rotation,
    isDragging,
}) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);
    const style = getZoneStyle(object.color, object.opacity, Math.min(length, width), object.hollow);

    const x = -width / 2;
    const y = -length;
    const highlightOffset = style.strokeWidth;
    const highlightWidth = width + highlightOffset;
    const highlightLength = length + highlightOffset;

    const patternWidth = width;
    const patternHeight = Math.round(width / 2);

    const arrowWidth = patternWidth * ARROW_SIZE_FRAC;
    const arrowThickness = arrowWidth * ARROW_THICKNESS_FRAC;

    const arrowProps: Omit<ChevronWithTailConfig, 'thickness'> = {
        ...getArrowStyle(object.color, object.opacity * 3),
        opacity: (object.opacity * 2) / 100,
    };

    const sideArrowProps: ChevronWithTailConfig = {
        ...arrowProps,
        width: arrowWidth,
        thickness: arrowThickness,
        tailGap: arrowThickness * 0.1,
        y: patternHeight / 2,
        chevronAngle: CHEVRON_ANGLE,
    };
    const sideArrowX1 = patternWidth * ARROW_PAD;
    const sideArrowX2 = patternWidth - sideArrowX1;

    const backgroundProps: RectConfig = object.hollow ? { stroke: undefined } : {};

    const arrowRef = useRef<Konva.Group>(null);
    const [pattern, setPattern] = useState<HTMLImageElement>();
    useObjectLoading(pattern === undefined);
    const [cachedPatternWidth, setCachedPatternWidth] = useState<number>(patternWidth);
    const [cachedPatternHeight, setCachedPatternHeight] = useState<number>(patternHeight);

    useDebouncedEffect(
        () => {
            arrowRef.current?.toImage({
                callback: (img) => {
                    setPattern(img);
                    setCachedPatternWidth(img.width);
                    setCachedPatternHeight(img.height);
                },
            });
        },
        [patternWidth, patternHeight, object.color, object.opacity, arrowRef, object.multiHit],
        MIN_REDRAW_MS,
        MAX_REDRAW_MS,
    );

    return (
        <>
            <Group rotation={rotation} {...overrideProps}>
                {highlightProps && (
                    <Rect
                        x={x}
                        y={y}
                        width={highlightWidth}
                        height={highlightLength}
                        offsetX={highlightOffset / 2}
                        offsetY={highlightOffset / 2}
                        {...highlightProps}
                    />
                )}
                <HideGroup>
                    <Rect x={x} y={y} width={width} height={length} {...style} {...backgroundProps} />
                    {/* TODO: fillPatternImage color is washed out compared to offscreen shape for some reason */}
                    <Rect
                        x={x}
                        y={y}
                        width={width}
                        height={length}
                        fillPatternImage={pattern}
                        fillPatternOffsetX={cachedPatternWidth / 2}
                        fillPatternOffsetY={cachedPatternHeight / 2}
                        fillPatternX={width / 2}
                        fillPatternY={length / 2}
                        fillPatternScaleX={patternWidth / cachedPatternWidth}
                        fillPatternScaleY={patternHeight / cachedPatternHeight}
                        fillPatternRepeat="repeat-y"
                    />
                    <ChevronTail
                        rotation={180 - rotation}
                        chevronAngle={CHEVRON_ANGLE}
                        x={0}
                        y={-length / 2}
                        width={width * 0.2}
                        thickness={width * 0.065}
                        offsetY={width * 0.1}
                        {...arrowProps}
                        doubleChevron={object.multiHit}
                    />

                    {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}
                </HideGroup>
            </Group>

            {/* Offscreen group to create the fill pattern */}
            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <Rect width={patternWidth} height={patternHeight} />
                <ChevronTail x={sideArrowX1} rotation={90} {...sideArrowProps} doubleChevron={object.multiHit} />
                <ChevronTail x={sideArrowX2} rotation={-90} {...sideArrowProps} doubleChevron={object.multiHit} />
            </Group>
        </>
    );
};

const LineStackContainer = createLineShapeContainer(LineStackRenderer, MIN_LINE_WIDTH, MIN_LINE_LENGTH);

registerRenderer<LineStackZone>(ObjectType.LineStack, LayerName.Ground, LineStackContainer);

const LineStackDetails: React.FC<ListComponentProps<LineStackZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<LineStackZone>(ObjectType.LineStack, LineStackDetails);
