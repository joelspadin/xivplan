import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { useEffect, useMemo, useRef } from 'react';
import { Circle, Group, Path } from 'react-konva';
import counterClockwise from '../../assets/zone/rotate_ccw.png';
import clockwise from '../../assets/zone/rotate_cw.png';
import { DetailsItem } from '../../panel/LayerItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { CircleZone, ObjectType } from '../../scene';
import { PrefabIcon } from '../PrefabIcon';
import { getArrowStyle, getShadowColor, getZoneStyle } from './style';

const DEFAULT_RADIUS = 25;
const DEFAULT_OPACITY = 50;
const CLOCKWISE_COLOR = '#fc972b';
const COUNTER_CLOCKWISE_COLOR = '#0066ff';

export const ZoneRotateClockwise: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Rotating clockwise"
            icon={clockwise}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RotateCW,
                        color: CLOCKWISE_COLOR,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

export const ZoneRotateCounterClockwise: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Rotating counter-clockwise"
            icon={counterClockwise}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RotateCCW,
                        color: COUNTER_CLOCKWISE_COLOR,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], (object, position) => {
    return {
        type: 'zones',
        op: 'add',
        value: {
            type: ObjectType.RotateCW,
            color: CLOCKWISE_COLOR,
            opacity: DEFAULT_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const Arrow: React.FC<ShapeConfig> = (props) => {
    return <Path data="M0-4-7 3-6 4-3 4 0 1 3 4 6 4 7 3Z" lineJoin="round" {...props} />;
};

const ARROW_SCALE = 1 / 24;
const ARROW_ANGLES = [45, 90, 135, 225, 270, 315];

const RotateRenderer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    const isClockwise = object.type === ObjectType.RotateCW;
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, Math.max(50, object.opacity), object.radius * 2),
        [object.color, object.opacity, object.radius],
    );
    const arrow = useMemo(() => {
        const scale = object.radius * ARROW_SCALE;

        return {
            ...getArrowStyle(object.color, 100),
            offsetX: -1 / ARROW_SCALE,
            scaleX: scale,
            scaleY: scale * (isClockwise ? -1 : 1),
            stroke: getShadowColor(object.color),
            strokeWidth: object.radius / 15,
        } as ShapeConfig;
    }, [style.stroke, object.opacity, object.radius, isClockwise]);

    // Cache so overlapping shapes with opacity appear as one object.
    const groupRef = useRef<Konva.Group>(null);
    useEffect(() => {
        groupRef.current?.cache();
    }, [object.color, object.opacity, object.radius, groupRef]);

    return (
        <Group x={center.x} y={center.y} opacity={(object.opacity * 2) / 100} ref={groupRef}>
            <Circle radius={object.radius} {...style} />
            {ARROW_ANGLES.map((r, i) => (
                <Arrow key={i} rotation={r} fillAfterStrokeEnabled strokeScaleEnabled={false} {...arrow} />
            ))}
        </Group>
    );
};

registerRenderer<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], RotateRenderer);

const RotateDetails: React.FC<ListComponentProps<CircleZone>> = ({ object }) => {
    const name = object.type === ObjectType.RotateCW ? 'Clockwise' : 'Counter-clockwise';
    const icon = object.type === ObjectType.RotateCW ? clockwise : counterClockwise;

    return <DetailsItem icon={icon} name={name} />;
};

registerListComponent<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], RotateDetails);

// Properties control registered in ZoneCircle.tsx
