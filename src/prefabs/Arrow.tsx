import { ArrowUpRegular } from '@fluentui/react-icons';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import * as React from 'react';
import { Arrow, Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { getArrowStrokeExtent } from '../arrowUtil';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { LayerName } from '../render/layers';
import { ArrowObject, ObjectType } from '../scene';
import { COLOR_RED } from '../theme';
import { usePanelDrag } from '../usePanelDrag';
import { CompositeReplaceGroup } from './CompositeReplaceGroup';
import { HideCutoutGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useHighlightProps } from './highlight';

// TODO: This would be a lot nicer if you could just click on start position
// and drag to end position instead of having a set initial size/rotation.

const NAME = 'Arrow';

const DEFAULT_ARROW_WIDTH = 30;
const DEFAULT_ARROW_HEIGHT = 150;
const DEFAULT_ARROW_COLOR = COLOR_RED;
const DEFAULT_ARROW_OPACITY = 100;

const Icon = ArrowUpRegular;

export const MarkerArrow: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
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

const ArrowRenderer: React.FC<RendererProps<ArrowObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);

    const pointerLength = DEFAULT_ARROW_HEIGHT * 0.15;

    // respect the stroke width when calculating the pointer size to avoid cropping
    const extent = getArrowStrokeExtent(pointerLength, DEFAULT_ARROW_WIDTH, STROKE_WIDTH);

    const arrowProps: ArrowConfig = {
        points: POINTS,
        width: DEFAULT_ARROW_WIDTH,
        height: DEFAULT_ARROW_HEIGHT,
        scaleX: object.width / DEFAULT_ARROW_WIDTH,
        scaleY: object.height / DEFAULT_ARROW_HEIGHT,
        pointerLength: pointerLength - extent.top - extent.bottom,
        pointerWidth: DEFAULT_ARROW_WIDTH - extent.side * 2,
        strokeWidth: STROKE_WIDTH,
        lineCap: 'round',
        pointerAtBeginning: !!object.arrowBegin,
        pointerAtEnding: !!object.arrowEnd,
    };

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps} listening={!object.hide}>
                    {highlightProps && (
                        <Arrow
                            {...arrowProps}
                            {...highlightProps}
                            strokeWidth={STROKE_WIDTH + (highlightProps.strokeWidth ?? 0)}
                        />
                    )}
                    <Rect width={object.width} height={object.height} fill="transparent" />
                    <HideCutoutGroup>
                        <CompositeReplaceGroup enabled={!!highlightProps} opacity={object.opacity / 100}>
                            <Arrow {...arrowProps} fill={object.color} stroke={object.color} />
                        </CompositeReplaceGroup>
                    </HideCutoutGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<ArrowObject>(ObjectType.Arrow, LayerName.Default, ArrowRenderer);

const ArrowDetails: React.FC<ListComponentProps<ArrowObject>> = (props) => {
    return <DetailsItem icon={<Icon color={props.object.color} />} name={NAME} {...props} />;
};

registerListComponent<ArrowObject>(ObjectType.Arrow, ArrowDetails);
