import Color from 'colorjs.io';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { RefObject, useMemo, useRef } from 'react';
import { Circle, Group, Line, Path } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/eye.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { sceneVars, SELECTED_PROPS } from '../../render/sceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useKonvaCache } from '../../useKonvaCache';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';

// TODO: add an option for a "look towards" marker

const DEFAULT_RADIUS = 25;
const DEFAULT_OPACITY = 100;
const DEFAULT_COLOR = '#ff0000';

export const ZoneEye: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Look away"
            icon={<Icon />}
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
    const c = new Color(color);

    const eye = '#ffffff';

    // TODO: update to c.set({ alpha: value }) once colorjs.io v0.6.0 is released
    const inside = c.clone();
    inside.alpha = 0.8;
    const insideStr = inside.display();

    const middle = c.to('hsv');
    middle.alpha = 0;
    middle.v -= 40;
    const middleStr = middle.display();

    const edge = c.clone();
    edge.alpha = 0;
    const edgeStr = edge.display();

    return [0, eye, 0.1, eye, 0.14, insideStr, 0.18, middleStr, 1, edgeStr];
}

function getEyeGradient(color: string) {
    const c = new Color(color);

    const inside = c.toString();
    const middle = c
        .to('hsv')
        .set({ v: (v) => v - 40 })
        .display();
    const edge = c
        .to('hsv')
        .set({ v: (v) => v - 80 })
        .display();

    return [0.14, inside, 0.18, middle, 1, edge];
}

function getHighlightColor(color: string) {
    const c = new Color(color);

    return c
        .to('hsv')
        .set({
            s: (s) => s - 30,
            v: (v) => v + 10,
        })
        .display();
}

function getStrokeColor(color: string) {
    const c = new Color(color);

    // TODO: update to c.set({ alpha: value }) once colorjs.io v0.6.0 is released
    c.alpha = 0.5;

    return c
        .to('hsv')
        .set({ v: (v) => v - 80 })
        .display();
}

const OUTER_EYE_PATH = 'M22 0Q13-9 0-9T-22 0Q-13 9 0 9T22 0Z';
const INNER_EYE_PATH = 'M20 0Q10-9 0-9T-20 0Q-10 9 0 9T20 0Z';

interface EyeRendererProps extends RendererProps<CircleZone> {
    radius: number;
    groupRef: RefObject<Konva.Group>;
}

const EyeRenderer: React.FC<EyeRendererProps> = ({ object, radius, groupRef }) => {
    const showHighlight = useShowHighlight(object);
    const scale = radius / 20;
    const eyeStyle = useMemo(() => {
        return {
            fillRadialGradientColorStops: getEyeGradient(object.color),
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndRadius: 15,
        } as ShapeConfig;
    }, [object.color]);
    const irisStyle = useMemo(() => {
        return {
            fillRadialGradientColorStops: getIrisGradient(object.color),
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndRadius: 15,
        } as ShapeConfig;
    }, [object.color]);

    const strokeColor = useMemo(() => getStrokeColor(object.color), [object.color]);
    const highlightColor = useMemo(() => getHighlightColor(object.color), [object.color]);

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [object.color, object.opacity, radius, showHighlight]);

    return (
        <>
            <Group opacity={object.opacity / 100} ref={groupRef}>
                <Group scaleX={scale} scaleY={scale}>
                    {showHighlight && (
                        <Path data={OUTER_EYE_PATH} scaleX={21 / 20} scaleY={22 / 20} {...SELECTED_PROPS} />
                    )}

                    <HideGroup>
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
                    </HideGroup>
                </Group>
            </Group>
        </>
    );
};

const EyeContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer object={object} onTransformEnd={() => groupRef.current?.clearCache()}>
            {({ radius }) => <EyeRenderer object={object} radius={radius} groupRef={groupRef} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Eye, LayerName.Ground, EyeContainer);

const EyeDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneEye]: object.color }} />}
            name="Look away"
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Eye, EyeDetails);
