import Konva from 'konva';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/line_stack.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { ChevronConfig, ChevronTail } from './shapes';
import { getArrowStyle } from './style';

const NAME = 'Line stack';

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 150;

export const ZoneLineStack: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.LineStack,
                        width: DEFAULT_WIDTH,
                        height: DEFAULT_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineStack, (object, position) => {
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

const OFFSCREEN_X = -1000;
const OFFSCREEN_Y = -1000;

const CHEVRON_ANGLE = 40;

const ARROW_SIZE_FRAC = 0.3;
const ARROW_HEIGHT_FRAC = 3 / 5;
const ARROW_PAD = 0.3;

const LineStackRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [pattern, setPattern] = useState<HTMLImageElement>();

    const patternWidth = object.width;
    const patternHeight = object.width / 2;

    const arrow = useMemo(() => {
        const width = patternWidth * ARROW_SIZE_FRAC;
        const height = width * ARROW_HEIGHT_FRAC;

        return {
            ...getArrowStyle(object.color, object.opacity * 2),
            width,
            height,
            y: patternHeight / 2,
            chevronAngle: CHEVRON_ANGLE,
        } as ChevronConfig;
    }, [object.color, object.opacity, patternWidth, patternHeight]);

    const arrowRef = useRef<Konva.Group>(null);
    useEffect(() => {
        arrowRef.current?.toImage({
            // This seems like a hack. Is there a better way to draw offscreen?
            x: OFFSCREEN_X,
            y: OFFSCREEN_Y,
            width: patternWidth,
            height: patternHeight,
            callback: setPattern,
        });
    }, [patternWidth, patternHeight, object.color, object.opacity, arrowRef]);

    return (
        <>
            <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true, keepRatio: false }}>
                {(groupProps) => (
                    <Group {...groupProps}>
                        {showHighlight && (
                            <Rect width={object.width} height={object.height} {...SELECTED_PROPS} opacity={0.25} />
                        )}
                        <Rect
                            width={object.width}
                            height={object.height}
                            fillPatternImage={pattern}
                            fillPatternOffsetX={patternWidth / 2}
                            fillPatternOffsetY={patternHeight / 2}
                            fillPatternX={object.width / 2}
                            fillPatternY={object.height / 2}
                            fillPatternRepeat="repeat-y"
                        />
                        <ChevronTail
                            rotation={180}
                            chevronAngle={CHEVRON_ANGLE}
                            x={object.width / 2}
                            y={object.height / 2}
                            width={object.width * 0.2}
                            height={object.width * 0.13}
                            fill={arrow.fill}
                        />
                    </Group>
                )}
            </ResizeableObjectContainer>

            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <ChevronTail x={patternWidth * ARROW_PAD} rotation={90} {...arrow} />
                <ChevronTail x={patternWidth * (1 - ARROW_PAD)} rotation={-90} {...arrow} />
            </Group>
        </>
    );
};

registerRenderer<RectangleZone>(ObjectType.LineStack, LayerName.Ground, LineStackRenderer);

const LineStackDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} object={object} />;
};

registerListComponent<RectangleZone>(ObjectType.LineStack, LineStackDetails);

// Properties control registered in ZoneRectangle.tsx
