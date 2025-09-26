import Konva from 'konva';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/stack.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ForegroundPortal } from '../../render/Portals';
import { LayerName } from '../../render/layers';
import { ObjectType, StackZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars, SELECTED_PROPS } from '../../theme';
import { useKonvaCache } from '../../useKonvaCache';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
import { useDraggableCenter } from '../useDraggableCenter';
import { Orb } from './Orb';
import { ChevronTail } from './shapes';
import { getStackCircleProps } from './stackUtil';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_RADIUS = 75;

export const ZoneStack: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();

    return (
        <PrefabIcon
            draggable
            name={t('ZoneStack.Name')}
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

registerDropHandler<StackZone>(ObjectType.Stack, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Stack,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            count: 1,
            ...object,
            ...position,
        } as StackZone,
    };
});

const CHEVRON_ANGLES = [45, 135, 225, 315];

interface StackRendererProps extends RendererProps<StackZone> {
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

                {object.count === 1 && (
                    <ChevronTail
                        rotation={180}
                        chevronAngle={ca}
                        width={cw * 0.6}
                        height={ch * 0.6}
                        {...arrow}
                        listening={false}
                    />
                )}
                {object.count > 1 && <StackOrbs object={object} radius={radius} ring={ring} orb={arrow} />}

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

interface StackOrbsProps extends StackRendererProps {
    ring: ReturnType<typeof getZoneStyle>;
    orb: CircleConfig;
}

const StackOrbs: React.FC<StackOrbsProps> = ({ object, radius, ring }) => {
    const center = useDraggableCenter();

    const orbRadius = Math.min(radius * 0.25, 40);
    const orbs = useMemo(() => getStackCircleProps(orbRadius, object.count), [orbRadius, object.count]);

    const shapeRef = useRef<Konva.Group>(null);

    useKonvaCache(shapeRef, [object, radius]);

    return (
        <ForegroundPortal>
            <Group ref={shapeRef} {...center} opacity={object.opacity / 40} listening={false}>
                <Circle
                    radius={orbRadius}
                    {...ring}
                    strokeWidth={ring.strokeWidth / 2}
                    opacity={0.35}
                    fill="transparent"
                />
                {orbs.map((props, i) => (
                    <Orb key={i} fill={object.color} {...props} />
                ))}
            </Group>
        </ForegroundPortal>
    );
};

const StackContainer: React.FC<RendererProps<StackZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {({ radius }) => <StackRenderer object={object} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<StackZone>(ObjectType.Stack, LayerName.Ground, StackContainer);

const StackDetails: React.FC<ListComponentProps<StackZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={t('ZoneStack.Name')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<StackZone>(ObjectType.Stack, StackDetails);
