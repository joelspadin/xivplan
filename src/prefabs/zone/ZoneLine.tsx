import { Circle, Group, Rect } from 'react-konva';
import Icon from '../../assets/zone/line.svg?react';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer } from '../../render/ObjectRegistry';
import { type LineZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../bounds';
import { HideGroup } from '../HideGroup';
import { useHighlightProps, useOverrideProps } from '../highlight';
import { createLineShapeContainer, type LineShapeRendererProps } from '../lines';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const NAME = 'Line';

const DEFAULT_WIDTH = 100;
const DEFAULT_LENGTH = 250;

const ICON_SIZE = 32;

export const ZoneLine: React.FC = () => {
    return (
        <PrefabIcon
            name={NAME}
            icon={<Icon />}
            object={{
                type: ObjectType.Line,
            }}
            getOffset={(e) => {
                const offset = getDragOffset(e);
                return {
                    x: offset.x,
                    y: offset.y - ICON_SIZE / 2,
                };
            }}
        />
    );
};

registerDropHandler<LineZone>(ObjectType.Line, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Line,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_WIDTH,
            length: DEFAULT_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const LineDetails: React.FC<ListComponentProps<LineZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<LineZone>(ObjectType.Line, LineDetails);

const LineRenderer: React.FC<LineShapeRendererProps<LineZone>> = ({ object, length, width, rotation, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);
    const style = getZoneStyle(object.color, object.opacity, Math.min(length, width), object.hollow);

    const x = -width / 2;
    const y = -length;
    const highlightOffset = style.strokeWidth;
    const highlightWidth = width + highlightOffset;
    const highlightLength = length + highlightOffset;

    return (
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
                <Rect x={x} y={y} width={width} height={length} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

const LineContainer = createLineShapeContainer(LineRenderer, MIN_LINE_WIDTH, MIN_LINE_LENGTH);

registerRenderer<LineZone>(ObjectType.Line, LayerName.Ground, LineContainer);
