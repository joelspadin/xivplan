import React, { useMemo } from 'react';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/circle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_AOE_COLOR,
    DEFAULT_AOE_OPACITY,
    sceneVars,
    SELECTED_PROPS,
} from '../../render/sceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Circle';

const DEFAULT_RADIUS = 50;

export const ZoneCircle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Circle,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Circle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Circle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface CircleRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
}

const CircleRenderer: React.FC<CircleRendererProps> = ({ object, radius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2, object.hollow),
        [object.color, object.opacity, object.hollow, radius],
    );

    return (
        <>
            {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

            <HideGroup>
                <Circle radius={radius} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const CircleContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <CircleRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Circle, LayerName.Ground, CircleContainer);

const CircleDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Circle, CircleDetails);
