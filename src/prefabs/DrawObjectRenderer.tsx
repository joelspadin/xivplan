import React, { useMemo } from 'react';
import { Group, Line } from 'react-konva';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { HIGHLIGHT_WIDTH, SELECTED_PROPS } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { DrawObject, ObjectType } from '../scene';
import { DRAW_LINE_PROPS } from './DrawObjectStyles';
import { HideCutoutGroup } from './HideGroup';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useShowHighlight } from './highlight';

function getLinePoints(object: DrawObject) {
    return object.points.map((v, i) => v * (i % 2 === 0 ? object.width : -object.height));
}

export const DrawObjectRenderer: React.FC<RendererProps<DrawObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const points = useMemo(() => getLinePoints(object), [object]);

    return (
        <ResizeableObjectContainer
            object={object}
            cache
            cacheKey={showHighlight}
            transformerProps={{ centeredScaling: true }}
        >
            {(groupProps) => (
                <Group {...groupProps} offsetX={0} offsetY={0} opacity={object.opacity / 100}>
                    {showHighlight && (
                        <Line
                            {...DRAW_LINE_PROPS}
                            {...SELECTED_PROPS}
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
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<DrawObject>(ObjectType.Draw, LayerName.Default, DrawObjectRenderer);

export const DrawDetails: React.FC<ListComponentProps<DrawObject>> = (props) => {
    return <DetailsItem name="Drawing" {...props} />;
};

registerListComponent<DrawObject>(ObjectType.Draw, DrawDetails);
