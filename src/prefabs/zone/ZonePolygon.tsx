import React, { useMemo } from 'react';
import { Group, RegularPolygon } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import icon from '../../assets/zone/polygon.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { LayerName } from '../../render/layers';
import { ObjectType, PolygonZone } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Regular Polygon';

const DEFAULT_RADIUS = 50;
const DEFAULT_SIDES = 6;

export const ZonePolygon: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Polygon,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<PolygonZone>(ObjectType.Polygon, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Polygon,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            sides: DEFAULT_SIDES,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface PolygonRendererProps extends RendererProps<PolygonZone> {
    radius: number;
    rotation: number;
}

const PolygonRenderer: React.FC<PolygonRendererProps> = ({ object, radius, rotation }) => {
    const isSelected = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2, object.hollow),
        [object.color, object.opacity, radius, object.hollow],
    );

    return (
        <Group rotation={rotation}>
            {isSelected && (
                <RegularPolygon
                    radius={radius + style.strokeWidth / 2}
                    sides={object.sides}
                    {...style}
                    {...SELECTED_PROPS}
                />
            )}
            <HideGroup>
                <RegularPolygon radius={radius} sides={object.sides} {...style} />
            </HideGroup>
        </Group>
    );
};

const PolygonContainer: React.FC<RendererProps<PolygonZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(props) => <PolygonRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<PolygonZone>(ObjectType.Polygon, LayerName.Ground, PolygonContainer);

const PolygonDetails: React.FC<ListComponentProps<PolygonZone>> = ({ object, ...props }) => {
    return <DetailsItem icon={icon} name={NAME} object={object} color={object.color} {...props} />;
};

registerListComponent<PolygonZone>(ObjectType.Polygon, PolygonDetails);
