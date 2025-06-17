import React, { useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/knockback.svg?react';
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
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_RADIUS = 150;

export const ZoneKnockback: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Circular knockback"
            icon={<Icon />}
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

interface KnockbackRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
}

const KnockbackRenderer: React.FC<KnockbackRendererProps> = ({ object, radius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const ring = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);

    const { cx, cw, ch, ca } = useMemo(() => {
        return {
            cx: radius,
            cw: radius * 0.24,
            ch: radius * 0.12,
            ca: 40,
        };
    }, [radius]);

    return (
        <>
            {showHighlight && <Circle radius={radius + ring.strokeWidth / 2} {...SELECTED_PROPS} />}

            <HideGroup>
                <Circle radius={radius} {...ring} strokeEnabled={false} opacity={0.5} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={ring.stroke} />}

                {CHEVRON_ANGLES.map((r, i) => (
                    <Group key={i} rotation={r} listening={false}>
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
            </HideGroup>
        </>
    );
};

const KnockbackContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <KnockbackRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Knockback, LayerName.Ground, KnockbackContainer);

const KnockbackDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name="Knockback"
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Knockback, KnockbackDetails);
