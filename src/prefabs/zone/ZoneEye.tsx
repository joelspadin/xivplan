import Color from 'colorjs.io';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { RefObject, useRef } from 'react';
import { Circle, Group, Line, Path } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/eye.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { EyeObject, ObjectType } from '../../scene';
import { panelVars } from '../../theme';
import { useKonvaCache } from '../../useKonvaCache';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';

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

registerDropHandler<EyeObject>(ObjectType.Eye, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Eye,
            color: DEFAULT_COLOR,
            opacity: DEFAULT_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        } as EyeObject,
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

function getEyeGradient(color: string, invert?: boolean) {
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

    return [0.14, invert ? middle : inside, 0.18, middle, 1, edge];
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

interface EyeRendererProps extends RendererProps<EyeObject> {
    radius: number;
    groupRef: RefObject<Konva.Group | null>;
}

const EyeRenderer: React.FC<EyeRendererProps> = ({ object, radius, groupRef }) => {
    const highlightProps = useHighlightProps(object);
    const scale = radius / 20;
    const eyeStyle: ShapeConfig = {
        fillRadialGradientColorStops: getEyeGradient(object.color, object.invert),
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: 15,
    };
    const irisStyle: ShapeConfig = {
        fillRadialGradientColorStops: getIrisGradient(object.color),
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: 15,
    };

    const strokeColor = getStrokeColor(object.color);
    const highlightColor = getHighlightColor(object.color);

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [object.color, object.opacity, radius, highlightProps]);

    return (
        <>
            <Group ref={groupRef}>
                <Group scaleX={scale} scaleY={scale}>
                    {highlightProps && (
                        <Path data={OUTER_EYE_PATH} scaleX={21 / 20} scaleY={22 / 20} {...highlightProps} />
                    )}

                    <HideGroup opacity={object.opacity / 100}>
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
                        {object.invert ? <QuestionMark /> : <Circle radius={10} {...irisStyle} />}
                    </HideGroup>
                </Group>
            </Group>
        </>
    );
};

const QUESTION_PATH = `
    M-17.5-15c0 5 2 5 3 5 3 0 5.5-1 5.5-7s4.5-8.5 9-8.5C5.5-25.5 9.5-21 9.5-13.5 9.5-5-2-3-2 11
    c0 4 0 7 2 7 2 0 2-3 2-7C2-2 17.5 0 17.5-14 17.5-24 11.5-29 0-29-14.5-29-17.5-19.5-17.5-15Z
    M0 20.5c-2.5 0-4 1.5-4 3.5 0 3 1.5 6 4 6s4-3 4-6c0-2-1.5-3.5-4-3.5Z`;
const QUESTION_SCALE = 24 / 60;
const QUESTION_SHADOW_COLOR = '#e868e6';

const QuestionMark: React.FC = () => {
    return (
        <Path
            data={QUESTION_PATH}
            scaleX={QUESTION_SCALE}
            scaleY={QUESTION_SCALE}
            stroke={QUESTION_SHADOW_COLOR}
            strokeWidth={2}
            fillAfterStrokeEnabled
            shadowColor={QUESTION_SHADOW_COLOR}
            shadowBlur={4}
            shadowForStrokeEnabled
            fill="#ffffff"
        />
    );
};

const EyeContainer: React.FC<RendererProps<EyeObject>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer object={object} onTransformEnd={() => groupRef.current?.clearCache()}>
            {({ radius }) => <EyeRenderer object={object} radius={radius} groupRef={groupRef} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<EyeObject>(ObjectType.Eye, LayerName.Ground, EyeContainer);

const EyeDetails: React.FC<ListComponentProps<EyeObject>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneEye]: object.color }} />}
            name={object.invert ? 'Look towards' : 'Look away'}
            object={object}
            {...props}
        />
    );
};

registerListComponent<EyeObject>(ObjectType.Eye, EyeDetails);
