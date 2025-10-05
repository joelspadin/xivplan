import React from 'react';
import { Circle, Ring } from 'react-konva';
import Icon from '../../assets/zone/donut.svg?react';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { DonutZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getZoneStyle } from './style';

const NAME = 'Donut';

const DEFAULT_OUTER_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 50;

export const ZoneDonut: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Donut,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<DonutZone>(ObjectType.Donut, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Donut,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            innerRadius: DEFAULT_INNER_RADIUS,
            radius: DEFAULT_OUTER_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface DonutRendererProps extends RendererProps<DonutZone> {
    radius: number;
    innerRadius: number;
    isDragging?: boolean;
}

const DonutRenderer: React.FC<DonutRendererProps> = ({ object, radius, innerRadius, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, radius * 2);

    const highlightInnerRadius = Math.min(radius, innerRadius);
    const highlightOuterRadius = Math.max(radius, innerRadius);

    return (
        <>
            {highlightProps && (
                <Ring
                    innerRadius={highlightInnerRadius - style.strokeWidth / 2}
                    outerRadius={highlightOuterRadius + style.strokeWidth / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <Ring innerRadius={innerRadius} outerRadius={radius} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const DonutContainer: React.FC<RendererProps<DonutZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowInnerRadius>
            {(props) => <DonutRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<DonutZone>(ObjectType.Donut, LayerName.Ground, DonutContainer);

const DonutDetails: React.FC<ListComponentProps<DonutZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<DonutZone>(ObjectType.Donut, DonutDetails);
