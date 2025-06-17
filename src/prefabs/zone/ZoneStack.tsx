import React, { useMemo } from 'react';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/stack.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, sceneVars, SELECTED_PROPS } from '../../render/sceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const NAME = 'Stack';

const DEFAULT_RADIUS = 75;

export const ZoneStack: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Stack,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Stack, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Stack,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const CHEVRON_ANGLES = [45, 135, 225, 315];

interface StackRendererProps extends RendererProps<CircleZone> {
    radius: number;
}

const StackRenderer: React.FC<StackRendererProps> = ({ object, radius }) => {
    const showHighlight = useShowHighlight(object);
    const ring = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 2), [object.color, object.opacity]);

    const { cx, cw, ch, ca } = useMemo(() => {
        return {
            cx: radius * 0.6,
            cw: radius * 0.5,
            ch: radius * 0.325,
            ca: 40,
        };
    }, [radius]);

    return (
        <>
            {showHighlight && <Circle radius={radius + ring.strokeWidth} {...SELECTED_PROPS} opacity={0.35} />}

            <HideGroup>
                <Circle radius={radius} {...ring} opacity={0.75} fill="transparent" />
                <ChevronTail
                    rotation={180}
                    chevronAngle={ca}
                    width={cw * 0.6}
                    height={ch * 0.6}
                    {...arrow}
                    listening={false}
                />

                {CHEVRON_ANGLES.map((r, i) => (
                    <ChevronTail
                        key={i}
                        offsetY={-cx}
                        rotation={r}
                        chevronAngle={ca}
                        width={cw}
                        height={ch}
                        {...arrow}
                    />
                ))}
            </HideGroup>
        </>
    );
};

const StackContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {({ radius }) => <StackRenderer object={object} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Stack, LayerName.Ground, StackContainer);

const StackDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Stack, StackDetails);
