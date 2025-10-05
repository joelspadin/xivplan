import { Vector2d } from 'konva/lib/types';
import React from 'react';
import { Circle, Group } from 'react-konva';
import Icon from '../../assets/zone/exaflare.svg?react';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ExaflareZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { EXAFLARE_SPACING_DEFAULT } from './constants';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const NAME = 'Moving AOE';

const DEFAULT_RADIUS = 50;
const DEFAULT_LENGTH = 6;

export const ZoneExaflare: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Exaflare,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<ExaflareZone>(ObjectType.Exaflare, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Exaflare,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            length: DEFAULT_LENGTH,
            spacing: EXAFLARE_SPACING_DEFAULT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const ARROW_W_FRAC = 0.8;
const ARROW_H_FRAC = 0.5;

function getTrailPositions(radius: number, length: number, spacing: number): Vector2d[] {
    return Array.from({ length }).map((_, i) => ({
        x: 0,
        y: -((radius * 2 * spacing) / 100) * i,
    }));
}

function getDashSize(radius: number) {
    return (2 * Math.PI * radius) / 32;
}

interface ExaflareRendererProps extends RendererProps<ExaflareZone> {
    radius: number;
    rotation: number;
    isDragging?: boolean;
}

const ExaflareRenderer: React.FC<ExaflareRendererProps> = ({ object, radius, rotation, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, radius * 2);

    const arrow = getArrowStyle(object.color, object.opacity * 3);
    const trail = getTrailPositions(radius, object.length, object.spacing);
    const dashSize = getDashSize(radius);

    return (
        <>
            <Group rotation={rotation}>
                <HideGroup>
                    {trail.map((point, i) => (
                        <Circle
                            key={i}
                            listening={false}
                            radius={radius}
                            {...point}
                            {...style}
                            fillEnabled={false}
                            dash={[dashSize, dashSize]}
                            dashOffset={dashSize / 2}
                            opacity={0.5}
                        />
                    ))}
                </HideGroup>

                {highlightProps && <Circle radius={radius + style.strokeWidth / 2} {...highlightProps} />}

                <HideGroup>
                    <Circle radius={radius} {...style} />
                    <ChevronTail
                        y={-radius * ARROW_H_FRAC * 0.9}
                        width={radius * ARROW_W_FRAC}
                        height={radius * ARROW_H_FRAC}
                        {...arrow}
                    />

                    {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
                </HideGroup>
            </Group>
        </>
    );
};

const ExaflareContainer: React.FC<RendererProps<ExaflareZone>> = ({ object }) => {
    // TODO: add control point for trail length
    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(props) => <ExaflareRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<ExaflareZone>(ObjectType.Exaflare, LayerName.Ground, ExaflareContainer);

const ExaflareDetails: React.FC<ListComponentProps<ExaflareZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<ExaflareZone>(ObjectType.Exaflare, ExaflareDetails);
