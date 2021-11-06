import { getColorFromString, updateA, updateSV } from '@fluentui/react';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { RefObject, useEffect, useMemo, useRef } from 'react';
import { Circle, Group, Line, Path } from 'react-konva';
import icon from '../../assets/zone/eye.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { SELECTED_PROPS } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const DEFAULT_RADIUS = 25;
const DEFAULT_OPACITY = 100;
const DEFAULT_COLOR = '#ff0000';

export const ZoneEye: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Look away"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Eye,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Eye, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Eye,
            color: DEFAULT_COLOR,
            opacity: DEFAULT_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

function getIrisGradient(color: string) {
    const c = getColorFromString(color);
    if (!c) {
        return [0, color];
    }

    const eye = '#ffffff';
    const inside = updateA(c, 0.8).str;
    const middle = updateA(updateSV(c, c.s, c.v - 40), 0).str;
    const edge = updateA(c, 0).str;

    return [0, eye, 0.1, eye, 0.14, inside, 0.18, middle, 1, edge];
}

function getEyeGradient(color: string) {
    const c = getColorFromString(color);
    if (!c) {
        return [0, color];
    }

    const inside = c.str;
    const middle = updateSV(c, c.s, c.v - 40).str;
    const edge = updateSV(c, c.s, c.v - 80).str;

    return [0.14, inside, 0.18, middle, 1, edge];
}

function getHighlightColor(color: string) {
    const c = getColorFromString(color);
    if (!c) {
        return color;
    }

    return updateSV(c, c.s - 30, c.v + 30).str;
}

function getStrokeColor(color: string) {
    const c = getColorFromString(color);
    if (!c) {
        return color;
    }

    return updateA(updateSV(c, c.s, c.v - 80), 50).str;
}

const OUTER_EYE_PATH = 'M22 0Q13-9 0-9T-22 0Q-13 9 0 9T22 0Z';
const INNER_EYE_PATH = 'M20 0Q10-9 0-9T-20 0Q-10 9 0 9T20 0Z';

interface EyeRendererProps extends RendererProps<CircleZone> {
    radius: number;
    groupRef: RefObject<Konva.Group>;
}

const EyeRenderer: React.FC<EyeRendererProps> = ({ object, index, radius, groupRef }) => {
    const showHighlight = useShowHighlight(object, index);
    const scale = radius / 20;
    const eyeStyle = useMemo(() => {
        return {
            fillRadialGradientColorStops: getEyeGradient(object.color),
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndRadius: 15,
        } as ShapeConfig;
    }, [object.color, object.opacity, radius]);
    const irisStyle = useMemo(() => {
        return {
            fillRadialGradientColorStops: getIrisGradient(object.color),
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndRadius: 15,
        } as ShapeConfig;
    }, [object.color, object.opacity, radius]);

    const strokeColor = useMemo(() => getStrokeColor(object.color), [object.color]);
    const highlightColor = useMemo(() => getHighlightColor(object.color), [object.color]);

    // Cache so overlapping shapes with opacity appear as one object.
    useEffect(() => {
        groupRef.current?.cache();
    }, [object.color, object.opacity, radius, showHighlight, groupRef]);

    return (
        <>
            <Group opacity={object.opacity / 100} ref={groupRef}>
                <Group scaleX={scale} scaleY={scale}>
                    {showHighlight && (
                        <Path data={OUTER_EYE_PATH} scaleX={21 / 20} scaleY={22 / 20} {...SELECTED_PROPS} />
                    )}

                    <Path
                        data={OUTER_EYE_PATH}
                        fill={highlightColor}
                        stroke={strokeColor}
                        strokeWidth={3}
                        fillAfterStrokeEnabled
                    />

                    <Path data={INNER_EYE_PATH} {...eyeStyle} />
                    <Line
                        points={[-19, 0, 19, 0]}
                        stroke={highlightColor}
                        strokeWidth={0.25}
                        opacity={0.7}
                        lineCap="round"
                    />
                    <Circle radius={10} {...irisStyle} />
                </Group>
            </Group>
        </>
    );
};

const EyeContainer: React.FC<RendererProps<CircleZone>> = ({ object, index }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer object={object} index={index} onTransformEnd={() => groupRef.current?.clearCache()}>
            {({ radius }) => <EyeRenderer object={object} index={index} radius={radius} groupRef={groupRef} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Eye, LayerName.Ground, EyeContainer);

const EyeDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Look away" index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Eye, EyeDetails);
