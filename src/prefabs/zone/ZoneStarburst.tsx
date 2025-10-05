import { ShapeConfig } from 'konva/lib/Shape';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React from 'react';
import { Circle, Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/starburst.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, StarburstZone } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MIN_STARBURST_SPOKE_WIDTH } from '../bounds';
import { useHighlightProps } from '../highlight';
import { StarburstControlContainer } from './StarburstContainer';
import { getZoneStyle } from './style';

const NAME = 'Starburst';

const DEFAULT_RADIUS = 250;
const DEFAULT_SPOKE_WIDTH = 40;
const DEFAULT_SPOKE_COUNT = 8;

export const ZoneStarburst: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Starburst,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<StarburstZone>(ObjectType.Starburst, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Starburst,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            spokes: DEFAULT_SPOKE_COUNT,
            spokeWidth: DEFAULT_SPOKE_WIDTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface StarburstConfig extends CircleConfig {
    radius: number;
    spokes: number;
    spokeWidth: number;
    highlightProps?: ShapeConfig;
}

function getOddRotations(spokes: number) {
    return Array.from({ length: spokes }).map((_, i) => 180 + (i / spokes) * 360);
}

const StarburstOdd: React.FC<StarburstConfig> = ({
    rotation,
    radius,
    spokes,
    spokeWidth,
    highlightProps,
    ...props
}) => {
    const items = getOddRotations(spokes);

    const rect = {
        offsetX: spokeWidth / 2,
        width: spokeWidth,
        height: radius,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {highlightProps &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...highlightProps}
                    />
                ))}

            <HideGroup>
                {items.map((r, i) => (
                    <Rect key={i} rotation={r} {...rect} />
                ))}
            </HideGroup>
        </Group>
    );
};

function getEvenRotations(spokes: number) {
    const items = spokes / 2;
    return Array.from({ length: items }).map((_, i) => (i / items) * 180);
}

const StarburstEven: React.FC<StarburstConfig> = ({
    rotation,
    radius,
    spokes,
    spokeWidth,
    highlightProps,
    ...props
}) => {
    const items = getEvenRotations(spokes);

    const rect = {
        offsetX: spokeWidth / 2,
        offsetY: radius,
        width: spokeWidth,
        height: radius * 2,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {highlightProps &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        offsetY={highlightHeight / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...highlightProps}
                    />
                ))}

            <HideGroup>
                {items.map((r, i) => (
                    <Rect key={i} rotation={r} {...rect} />
                ))}
            </HideGroup>
        </Group>
    );
};

interface StarburstRendererProps extends RendererProps<StarburstZone> {
    radius: number;
    rotation: number;
    spokeWidth: number;
    isDragging?: boolean;
}

const StarburstRenderer: React.FC<StarburstRendererProps> = ({ object, radius, rotation, spokeWidth, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, object.spokeWidth * 2);

    const config: StarburstConfig = {
        ...style,
        radius,
        rotation,
        spokeWidth,
        spokes: object.spokes,
        highlightProps,
    };

    return (
        <Group>
            {object.spokes % 2 === 0 ? <StarburstEven {...config} /> : <StarburstOdd {...config} />}

            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
        </Group>
    );
};

const StarburstContainer: React.FC<RendererProps<StarburstZone>> = ({ object }) => {
    return (
        <StarburstControlContainer object={object} minSpokeWidth={MIN_STARBURST_SPOKE_WIDTH}>
            {(props) => <StarburstRenderer object={object} {...props} />}
        </StarburstControlContainer>
    );
};

registerRenderer<StarburstZone>(ObjectType.Starburst, LayerName.Ground, StarburstContainer);

const StarburstDetails: React.FC<ListComponentProps<StarburstZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<StarburstZone>(ObjectType.Starburst, StarburstDetails);
