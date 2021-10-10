import React, { useMemo, useState } from 'react';
import { Circle } from 'react-konva';
import icon from '../../assets/zone/stack.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { ActivePortal } from '../../render/Portals';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useIsSelected } from '../../SelectionProvider';
import { DraggableObject } from '../DraggableObject';
import { PrefabIcon } from '../PrefabIcon';
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

const StackRenderer: React.FC<RendererProps<CircleZone>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const ring = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 2), [object.color, object.opacity]);

    const { cx, cw, ch, ca } = useMemo(() => {
        return {
            cx: object.radius * 0.6,
            cw: object.radius * 0.5,
            ch: object.radius * 0.325,
            ca: 40,
        };
    }, [object.radius]);

    return (
        <ActivePortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                {isSelected && <Circle radius={object.radius + ring.strokeWidth} {...SELECTED_PROPS} />}

                <Circle radius={object.radius} {...ring} opacity={0.75} fill="transparent" />
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
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<CircleZone>(ObjectType.Stack, LayerName.Ground, StackRenderer);

const StackDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Stack, StackDetails);

// Properties control registered in ZoneCircle.tsx
