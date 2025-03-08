import { ArrowUpRegular } from '@fluentui/react-icons';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import * as React from 'react';
import { Arrow, Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { COLOR_RED, SELECTED_PROPS } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { ArrowObject, ObjectType } from '../scene';
import { usePanelDrag } from '../usePanelDrag';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useShowHighlight } from './highlight';

// TODO: This would be a lot nicer if you could just click on start position
// and drag to end position instead of having a set initial size/rotation.

const NAME = 'Arrow';

const DEFAULT_ARROW_WIDTH = 30;
const DEFAULT_ARROW_HEIGHT = 150;
const DEFAULT_ARROW_COLOR = COLOR_RED;
const DEFAULT_ARROW_OPACITY = 100;

const ICON = <ArrowUpRegular />;

export const MarkerArrow: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={ICON}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Arrow,
                        width: DEFAULT_ARROW_WIDTH,
                        height: DEFAULT_ARROW_HEIGHT,
                        arrowEnd: true,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<ArrowObject>(ObjectType.Arrow, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Arrow,
            color: DEFAULT_ARROW_COLOR,
            opacity: DEFAULT_ARROW_OPACITY,
            width: DEFAULT_ARROW_WIDTH,
            height: DEFAULT_ARROW_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const STROKE_WIDTH = DEFAULT_ARROW_WIDTH / 5;
const POINTS = [DEFAULT_ARROW_WIDTH / 2, DEFAULT_ARROW_HEIGHT, DEFAULT_ARROW_WIDTH / 2, 0];

const HIGHLIGHT_STROKE_WIDTH = STROKE_WIDTH + (SELECTED_PROPS.strokeWidth ?? 0);

const ArrowRenderer: React.FC<RendererProps<ArrowObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);

    // respect the stroke width when calculating the pointer width to avoid cropping
    const pointerLength = DEFAULT_ARROW_HEIGHT * 0.15;
    const tangent = pointerLength / (DEFAULT_ARROW_WIDTH * 0.5);
    const cotangent = 1 / tangent;
    const cosecant = 1 / Math.sin(Math.atan(tangent));
    const lengthOffset = STROKE_WIDTH * 0.5 * (1 + cosecant);
    const widthOffset = STROKE_WIDTH * (cotangent + cosecant);

    const arrowProps: ArrowConfig = {
        points: POINTS,
        width: DEFAULT_ARROW_WIDTH,
        height: DEFAULT_ARROW_HEIGHT,
        scaleX: object.width / DEFAULT_ARROW_WIDTH,
        scaleY: object.height / DEFAULT_ARROW_HEIGHT,
        pointerLength: pointerLength - lengthOffset,
        pointerWidth: DEFAULT_ARROW_WIDTH - widthOffset,
        strokeWidth: STROKE_WIDTH,
        lineCap: 'round',
        pointerAtBeginning: !!object.arrowBegin,
        pointerAtEnding: !!object.arrowEnd,
    };

    return (
        <ResizeableObjectContainer
            object={object}
            cache
            cacheKey={showHighlight}
            transformerProps={{ centeredScaling: true }}
        >
            {(groupProps) => (
                <Group {...groupProps} opacity={object.opacity / 100}>
                    <Rect width={object.width} height={object.height} fill="transparent" />
                    {showHighlight && (
                        <Arrow {...arrowProps} {...SELECTED_PROPS} strokeWidth={HIGHLIGHT_STROKE_WIDTH} />
                    )}

                    <Arrow {...arrowProps} fill={object.color} stroke={object.color} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<ArrowObject>(ObjectType.Arrow, LayerName.Default, ArrowRenderer);

const ArrowDetails: React.FC<ListComponentProps<ArrowObject>> = (props) => {
    // TODO: color filter icon?
    return <DetailsItem icon={ICON} name={NAME} {...props} />;
};

registerListComponent<ArrowObject>(ObjectType.Arrow, ArrowDetails);
