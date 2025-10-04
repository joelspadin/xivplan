import React from 'react';
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
import { ObjectType, PolygonZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
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
            orient: 'point',
            rotation: 0,
            ...object,
            ...position,
        } as PolygonZone,
    };
});

interface PolygonRendererProps extends RendererProps<PolygonZone> {
    radius: number;
    rotation: number;
}

const PolygonRenderer: React.FC<PolygonRendererProps> = ({ object, radius, rotation }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, radius * 2, object.hollow);

    const orientRotation = object.orient === 'side' ? 180 / object.sides : 0;

    return (
        <Group rotation={rotation + orientRotation}>
            {highlightProps && (
                <RegularPolygon
                    radius={radius + style.strokeWidth / 2}
                    sides={object.sides}
                    {...style}
                    {...highlightProps}
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

function getIconAndName(sides: number): [typeof TriangleIcon, string] {
    switch (sides) {
        case 3:
            return [TriangleIcon, 'Triangle'];
        case 4:
            return [SquareIcon, 'Square'];
        case 5:
            return [PentagonIcon, 'Pentagon'];
        case 6:
            return [HexagonIcon, 'Hexagon'];
        case 7:
            return [SeptagonIcon, 'Septagon'];
        case 8:
            return [OcatgonIcon, 'Octagon'];
        default:
            return [OcatgonIcon, 'Polygon'];
    }
}

const PolygonDetails: React.FC<ListComponentProps<PolygonZone>> = ({ object, ...props }) => {
    const [Icon, name] = getIconAndName(object.sides);
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={name}
            object={object}
            {...props}
        />
    );
};

registerListComponent<PolygonZone>(ObjectType.Polygon, PolygonDetails);
