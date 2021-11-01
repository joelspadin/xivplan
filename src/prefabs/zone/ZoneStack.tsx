import React, { useMemo } from 'react';
import { Circle } from 'react-konva';
import icon from '../../assets/zone/stack.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
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
            icon={icon}
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

const StackRenderer: React.FC<StackRendererProps> = ({ object, index, radius }) => {
    const showHighlight = useShowHighlight(object, index);
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
                <ChevronTail key={i} offsetY={-cx} rotation={r} chevronAngle={ca} width={cw} height={ch} {...arrow} />
            ))}
        </>
    );
};

const StackContainer: React.FC<RendererProps<CircleZone>> = ({ object, index }) => {
    return (
        <RadiusObjectContainer object={object} index={index}>
            {(radius) => <StackRenderer object={object} index={index} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Stack, LayerName.Ground, StackContainer);

const StackDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Stack, StackDetails);

// Properties control registered in ZoneCircle.tsx
