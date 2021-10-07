import React, { useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/knockback.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { PrefabIcon } from '../PrefabIcon';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_RADIUS = 150;

export const ZoneKnockback: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Circular knockback"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Knockback,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Knockback, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Knockback,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const CHEVRON_ANGLES = Array.from({ length: 16 }).map((_, i) => (i * 360) / 16);

const KnockbackRenderer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const ring = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);

    const { cx, cw, ch, ca } = useMemo(() => {
        return {
            cx: object.radius,
            cw: object.radius * 0.24,
            ch: object.radius * 0.12,
            ca: 40,
        };
    }, [object.radius]);

    return (
        <GroundPortal>
            <Group x={center.x} y={center.y}>
                <Circle radius={object.radius} {...ring} strokeEnabled={false} opacity={0.5} />

                {CHEVRON_ANGLES.map((r, i) => (
                    <Group key={i} rotation={r}>
                        {[0.25, 0.52, 0.85].map((s, j) => (
                            <ChevronTail
                                key={j}
                                offsetY={cx * s}
                                chevronAngle={ca}
                                width={cw * s}
                                height={ch * s}
                                opacity={object.opacity / 100}
                                {...arrow}
                            />
                        ))}
                    </Group>
                ))}
            </Group>
        </GroundPortal>
    );
};

registerRenderer<CircleZone>(ObjectType.Knockback, KnockbackRenderer);

const KnockbackDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Knockback" index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Knockback, KnockbackDetails);

// Properties control registered in ZoneCircle.tsx
