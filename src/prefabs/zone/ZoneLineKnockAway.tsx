import Konva from 'konva';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/line_knock_away.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useHighlightProps } from '../highlight';
import { ChevronConfig, ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 250;

export const ZoneLineKnockAway: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Line knock away"
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.LineKnockAway,
                        width: DEFAULT_WIDTH,
                        height: DEFAULT_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineKnockAway, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const OFFSCREEN_X = -10000;
const OFFSCREEN_Y = -10000;

const ARROW_SIZE_FRAC = 0.3;
const ARROW_HEIGHT_FRAC = 3 / 5;
const ARROW_PAD = 0.08;

const LineKnockAwayRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [pattern, setPattern] = useState<HTMLImageElement>();
    const style = getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height));
    const { fill, ...stroke } = style;

    const patternWidth = object.width;
    const patternHeight = object.width / 2;

    const width = patternWidth * ARROW_SIZE_FRAC;
    const height = width * ARROW_HEIGHT_FRAC;

    const arrow: ChevronConfig = {
        ...getArrowStyle(object.color, object.opacity * 3),
        width,
        height,
        y: patternHeight / 2,
        chevronAngle: 40,
        opacity: (object.opacity * 2) / 100,
    };

    const arrowRef = useRef<Konva.Group>(null);
    useLayoutEffect(() => {
        arrowRef.current?.toImage({
            // This seems like a hack. Is there a better way to draw offscreen?
            x: OFFSCREEN_X,
            y: OFFSCREEN_Y,
            width: patternWidth,
            height: patternHeight,
            callback: setPattern,
        });
    }, [patternWidth, patternHeight, object.color, object.opacity, arrowRef]);

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <>
            <ResizeableObjectContainer object={object} transformerProps={{ keepRatio: false }}>
                {(groupProps) => (
                    <Group {...groupProps}>
                        {highlightProps && (
                            <Rect
                                offsetX={highlightOffset / 2}
                                offsetY={highlightOffset / 2}
                                width={highlightWidth}
                                height={highlightHeight}
                                {...highlightProps}
                            />
                        )}
                        <HideGroup>
                            <Rect
                                width={object.width}
                                height={object.height}
                                fillPatternImage={pattern}
                                fillPatternOffsetX={patternWidth / 2}
                                fillPatternOffsetY={patternHeight / 2}
                                fillPatternX={object.width / 2}
                                fillPatternY={object.height / 2}
                                fillPatternRepeat="repeat-y"
                                {...stroke}
                            />
                        </HideGroup>
                    </Group>
                )}
            </ResizeableObjectContainer>
            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <Rect width={patternWidth} height={patternHeight} fill={fill} />
                <ChevronTail x={patternWidth * ARROW_PAD} rotation={-90} {...arrow} />
                <ChevronTail x={patternWidth * (1 - ARROW_PAD)} rotation={90} {...arrow} />
            </Group>
        </>
    );
};

registerRenderer<RectangleZone>(ObjectType.LineKnockAway, LayerName.Ground, LineKnockAwayRenderer);

const LineKnockAwayDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name="Line knock away"
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.LineKnockAway, LineKnockAwayDetails);
