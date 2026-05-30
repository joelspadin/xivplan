import { ArrowUpRegular } from '@fluentui/react-icons';
import type { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { Arrow, Group, Rect } from 'react-konva';
import { registerDropHandler } from '../DropHandler';
import { getArrowPointerDimensions } from '../arrowUtil';
import { DetailsItem } from '../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { registerRenderer } from '../render/ObjectRegistry';
import { LayerName } from '../render/layers';
import { type ArrowObject, ObjectType } from '../scene';
import { COLOR_RED } from '../theme';
import { CompositeReplaceGroup } from './CompositeReplaceGroup';
import { HideCutoutGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { useHighlightProps, useOverrideProps } from './highlight';
import { createLineShapeContainer, type LineShapeRendererProps } from './lines';

const NAME = 'Arrow';

const DEFAULT_ARROW_WIDTH = 30;
const MIN_ARROW_WIDTH = 20;
const DEFAULT_ARROW_LENGTH = 150;
const MIN_ARROW_LENGTH = 20;
const DEFAULT_ARROW_COLOR = COLOR_RED;
const DEFAULT_ARROW_OPACITY = 100;
const ARROW_POINTER_BASE_ANGLE = 60;
const ARROW_SHAFT_WIDTH_FRACTION = 0.2;

const Icon = ArrowUpRegular;

export const MarkerArrow: React.FC = () => {
    return (
        <PrefabIcon
            name={NAME}
            icon={<Icon />}
            object={{
                type: ObjectType.Arrow,
                width: DEFAULT_ARROW_WIDTH,
                length: DEFAULT_ARROW_LENGTH,
                arrowEnd: true,
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
            length: DEFAULT_ARROW_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const ArrowRenderer: React.FC<LineShapeRendererProps<ArrowObject>> = ({ object, length, width, rotation }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);
    const strokeWidth = width * ARROW_SHAFT_WIDTH_FRACTION;

    const pointerDimensions = getArrowPointerDimensions(width, ARROW_POINTER_BASE_ANGLE, strokeWidth);

    const arrowProps: ArrowConfig = {
        points: [0, 0, 0, -length],
        ...pointerDimensions,
        strokeWidth,
        lineCap: 'round',
        pointerAtBeginning: !!object.arrowBegin,
        pointerAtEnding: !!object.arrowEnd,
    };

    // The extra transparent `Rect` is to help select small arrows. The larger the arrow, the more
    // confusing it is to select it by clicking empty space, so cap its size.
    const dragAreaWidth = Math.min(DEFAULT_ARROW_WIDTH, width);

    return (
        <Group listening={!object.hide} rotation={rotation} {...overrideProps}>
            {highlightProps && (
                <Arrow
                    {...arrowProps}
                    {...highlightProps}
                    strokeWidth={strokeWidth + (highlightProps.strokeWidth ?? 0)}
                />
            )}
            <Rect width={dragAreaWidth} height={length} x={-dragAreaWidth / 2} y={-length} fill="transparent" />
            <HideCutoutGroup>
                <CompositeReplaceGroup enabled={!!highlightProps} opacity={object.opacity / 100}>
                    <Arrow {...arrowProps} fill={object.color} stroke={object.color} />
                </CompositeReplaceGroup>
            </HideCutoutGroup>
        </Group>
    );
};

const ArrowContainer = createLineShapeContainer<ArrowObject>(ArrowRenderer, MIN_ARROW_WIDTH, MIN_ARROW_LENGTH);

registerRenderer<ArrowObject>(ObjectType.Arrow, LayerName.Default, ArrowContainer);

const ArrowDetails: React.FC<ListComponentProps<ArrowObject>> = (props) => {
    return <DetailsItem icon={<Icon color={props.object.color} />} name={NAME} {...props} />;
};

registerListComponent<ArrowObject>(ObjectType.Arrow, ArrowDetails);
