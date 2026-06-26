import React from 'react';
import { Group, Rect } from 'react-konva';
import { registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/square.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, type RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, type RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useHighlightProps, useOverrideProps } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Rectangle';

const DEFAULT_SIZE = 150;

export const ZoneSquare: React.FC = () => {
    return (
        <PrefabIcon
            name={NAME}
            icon={<Icon />}
            object={{
                type: ObjectType.Rect,
                width: DEFAULT_SIZE,
                height: DEFAULT_SIZE,
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Rect, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RectangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);

    return (
        <ResizeableObjectContainer object={object}>
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
                            <Rect
                                offsetX={highlightOffset / 2}
                                offsetY={highlightOffset / 2}
                                width={highlightWidth}
                                height={highlightHeight}
                                {...highlightProps}
                            />
                        )}
                        <HideGroup>
                            <Rect width={state.width} height={state.height} {...style} />
                        </HideGroup>
                    </Group>
                );
            }}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);
