import { DrawImageRegular } from '@fluentui/react-icons';
import React from 'react';
import { Group, Line } from 'react-konva';
import { DetailsItem } from '../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { type RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { LayerName } from '../render/layers';
import { type DrawObject, ObjectType } from '../scene';
import { HIGHLIGHT_WIDTH } from '../theme';
import { DRAW_LINE_PROPS } from './DrawObjectStyles';
import { HideCutoutGroup } from './HideGroup';
import { type ResizeableGroupState, ResizeableObjectContainer } from './ResizeableObjectContainer';
import { ModifierKeyBehavior } from './controlpoints';
import { useHighlightProps, useOverrideProps } from './highlight';

function getLinePoints(object: DrawObject, state: ResizeableGroupState) {
    return object.points.map((v, i) => v * (i % 2 === 0 ? state.width : -state.height));
}

export const DrawObjectRenderer: React.FC<RendererProps<DrawObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);

    return (
        <ResizeableObjectContainer
            object={object}
            transformationProps={{ centerScalingBehavior: ModifierKeyBehavior.ForceEnabled }}
        >
            {(state) => {
                const points = getLinePoints(object, state);
                return (
                    <Group {...state} offsetX={0} offsetY={0} opacity={object.opacity / 100} {...overrideProps}>
                        {highlightProps && (
                            <Line
                                {...DRAW_LINE_PROPS}
                                {...highlightProps}
                                points={points}
                                strokeWidth={object.brushSize + HIGHLIGHT_WIDTH}
                            />
                        )}
                        <HideCutoutGroup>
                            <Line
                                {...DRAW_LINE_PROPS}
                                points={points}
                                stroke={object.color}
                                strokeWidth={object.brushSize}
                            />
                        </HideCutoutGroup>
                    </Group>
                );
            }}
        </ResizeableObjectContainer>
    );
};

registerRenderer<DrawObject>(ObjectType.Draw, LayerName.Default, DrawObjectRenderer);

export const DrawDetails: React.FC<ListComponentProps<DrawObject>> = (props) => {
    return <DetailsItem icon={<DrawImageRegular color={props.object.color} />} name="Drawing" {...props} />;
};

registerListComponent<DrawObject>(ObjectType.Draw, DrawDetails);
