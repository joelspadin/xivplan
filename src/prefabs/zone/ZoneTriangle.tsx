import type { RectConfig } from 'konva/lib/shapes/Rect';
import React from 'react';
import { Group, Line } from 'react-konva';
import { registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/triangle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, type RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, type RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { ModifierKeyBehavior } from '../controlpoints';
import { useHighlightProps, useOverrideProps } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Triangle';

const DEFAULT_TRIANGLE_WIDTH = 100;
const DEFAULT_TRIANGLE_HEIGHT = Math.floor((DEFAULT_TRIANGLE_WIDTH * Math.sqrt(3)) / 2);

export const ZoneTriangle: React.FC = () => {
    return (
        <PrefabIcon
            name={NAME}
            icon={<Icon />}
            object={{
                type: ObjectType.Triangle,
                width: DEFAULT_TRIANGLE_WIDTH,
                height: DEFAULT_TRIANGLE_HEIGHT,
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Triangle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Triangle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_TRIANGLE_WIDTH,
            height: DEFAULT_TRIANGLE_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const EquilateralTriangle: React.FC<RectConfig> = ({ width, height, ...props }) => {
    const w = width ?? 0;
    const h = height ?? 0;
    // prettier-ignore
    const points = [
        w / 2, 0,
        0, h,
        w, h
    ];

    return <Line points={points} closed {...props} />;
};

const TriangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);

    return (
        <ResizeableObjectContainer
            object={object}
            transformationProps={{
                centerScalingBehavior: ModifierKeyBehavior.ForceEnabled,
                keepRatioBehavior: ModifierKeyBehavior.Inverted,
            }}
        >
            {(state) => {
                const style = getZoneStyle(
                    object.color,
                    object.opacity,
                    Math.min(state.width, state.height),
                    object.hollow,
                );

                const highlightOffset = style.strokeWidth;
                const highlightWidth = state.width + highlightOffset;
                const highlightHeight = state.height + highlightOffset;

                return (
                    <Group {...state} {...overrideProps}>
                        {highlightProps && (
                            <EquilateralTriangle
                                offsetX={highlightOffset / 2}
                                offsetY={highlightOffset / 2}
                                width={highlightWidth}
                                height={highlightHeight}
                                {...highlightProps}
                            />
                        )}
                        <HideGroup>
                            <EquilateralTriangle width={state.width} height={state.height} {...style} />
                        </HideGroup>
                    </Group>
                );
            }}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Triangle, LayerName.Ground, TriangleRenderer);

const TriangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Triangle, TriangleDetails);
