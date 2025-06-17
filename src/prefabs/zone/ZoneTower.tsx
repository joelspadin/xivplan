import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useMemo } from 'react';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/meteor_tower.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_OPACITY, sceneVars, SELECTED_PROPS } from '../../render/sceneTheme';
import { ObjectType, TowerZone } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
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

function getCountZones(radius: number, count: number): Partial<CircleConfig>[] {
    switch (count) {
        case 1:
            return [{ radius: radius * 0.5 }];

        case 2: {
            const r = radius * 0.9;

            return Array.from({ length: count }).map((_, i) => ({
                x: (-0.5 + i) * r,
                radius: r / count,
            }));
        }

        case 3: {
            const r = radius * 0.9;
            const scale = 2 / 3;

            return Array.from({ length: count }).map((_, i) => ({
                x: scale * (i - 1) * r,
                radius: r / count,
            }));
        }

        case 4:
            return Array.from({ length: count }).map((_, i) => {
                const angle = (Math.PI / 4) * (i * 2 - 1);
                const r = radius * 0.5;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                return {
                    x,
                    y,
                    radius: radius * 0.35,
                };
            });
    }

    return [];
}

interface TowerRendererProps extends RendererProps<TowerZone> {
    radius: number;
    isDragging?: boolean;
}

const TowerRenderer: React.FC<TowerRendererProps> = ({ object, radius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );

    const zones = useMemo(() => getCountZones(radius, object.count), [radius, object.count]);

    return (
        <>
            {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

            <HideGroup>
                <Circle radius={radius} {...style} opacity={0.75} />
                {zones.map((props, i) => (
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
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name="Meteor/tower"
            object={object}
            {...props}
        />
    );
};

registerListComponent<TowerZone>(ObjectType.Tower, TowerDetails);
