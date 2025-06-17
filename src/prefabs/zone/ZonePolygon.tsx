import React, { useMemo } from 'react';
import { Group, RegularPolygon } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import HexagonIcon from '../../assets/zone/hexagon.svg?react';
import OcatgonIcon from '../../assets/zone/octagon.svg?react';
import PentagonIcon from '../../assets/zone/pentagon.svg?react';
import SeptagonIcon from '../../assets/zone/septagon.svg?react';
import SquareIcon from '../../assets/zone/square.svg?react';
import TriangleIcon from '../../assets/zone/triangle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, sceneVars, SELECTED_PROPS } from '../../render/sceneTheme';
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

// TODO: add an option to determine whether point or side is at top

export const ZonePolygon: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<HexagonIcon />}
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

function getIcon(sides: number) {
    switch (sides) {
        case 3:
            return TriangleIcon;
        case 4:
            return SquareIcon;
        case 5:
            return PentagonIcon;
        case 6:
            return HexagonIcon;
        case 7:
            return SeptagonIcon;
        default:
            return OcatgonIcon;
    }
}

const PolygonDetails: React.FC<ListComponentProps<PolygonZone>> = ({ object, ...props }) => {
    const Icon = getIcon(object.sides);
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<PolygonZone>(ObjectType.Polygon, PolygonDetails);
