import { CircleConfig } from 'konva/lib/shapes/Circle';
import React from 'react';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/meteor_tower.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, TowerZone } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
import { getStackCircleProps, STACK_CIRCLE_INSET } from './stackUtil';
import { getZoneStyle } from './style';

const DEFAULT_COLOR = '#bae3ff';
const DEFAULT_RADIUS = 40;
const DEFAULT_COUNT = 1;

export const ZoneTower: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Meteor/tower"
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Tower,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<TowerZone>(ObjectType.Tower, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Tower,
            color: DEFAULT_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            count: DEFAULT_COUNT,
            ...object,
            ...position,
        },
    };
});

const CountZone: React.FC<CircleConfig> = (props) => {
    const offset = (props.radius ?? 0) * 0.15;
    return (
        <>
            <Circle {...props} />
            <Circle {...props} offsetY={offset} fillEnabled={false} opacity={0.5} />
            <Circle {...props} offsetY={offset * 2} fillEnabled={false} opacity={0.4} />
            <Circle {...props} offsetY={offset * 3} fillEnabled={false} opacity={0.3} />
            <Circle {...props} offsetY={offset * 4} fillEnabled={false} opacity={0.2} />
        </>
    );
};

interface TowerRendererProps extends RendererProps<TowerZone> {
    radius: number;
    isDragging?: boolean;
}

const TowerRenderer: React.FC<TowerRendererProps> = ({ object, radius, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, radius * 2);

    const towers = getStackCircleProps(radius, object.count, STACK_CIRCLE_INSET);

    return (
        <>
            {highlightProps && <Circle radius={radius + style.strokeWidth / 2} {...highlightProps} />}

            <HideGroup>
                <Circle radius={radius} {...style} opacity={0.75} />
                {towers.map((props, i) => (
                    <CountZone key={i} {...props} {...style} listening={false} />
                ))}

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const TowerContainer: React.FC<RendererProps<TowerZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <TowerRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<TowerZone>(ObjectType.Tower, LayerName.Ground, TowerContainer);

const TowerDetails: React.FC<ListComponentProps<TowerZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name="Meteor/tower"
            object={object}
            {...props}
        />
    );
};

registerListComponent<TowerZone>(ObjectType.Tower, TowerDetails);
