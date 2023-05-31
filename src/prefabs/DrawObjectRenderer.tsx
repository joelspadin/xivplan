import { Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Group, Line } from 'react-konva';
import { BrushSizeControl } from '../BrushSizeControl';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesControlRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { COLOR_SWATCHES, HIGHLIGHT_WIDTH, SELECTED_PROPS } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { DrawObject, ObjectType, SceneObject } from '../scene';
import { ResizeableObjectProperties } from './CommonProperties';
import { DRAW_LINE_PROPS } from './DrawObjectStyles';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useShowHighlight } from './highlight';
import { useSpinChanged } from './useSpinChanged';

function getLinePoints(object: DrawObject) {
    const points: number[] = [];

    for (const p of object.points) {
        points.push(p.x * object.width, -p.y * object.height);
    }

    return points;
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
                    <Line {...DRAW_LINE_PROPS} points={points} stroke={object.color} strokeWidth={object.brushSize} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<DrawObject>(ObjectType.Draw, LayerName.Default, DrawObjectRenderer);

export const DrawDetails: React.FC<ListComponentProps<DrawObject>> = ({ object, isNested }) => {
    return <DetailsItem name="Drawing" object={object} isNested={isNested} />;
};

registerListComponent<DrawObject>(ObjectType.Draw, DrawDetails);

export const DrawObjectEditControl: React.FC<PropertiesControlProps<DrawObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', value: { ...object, color } as SceneObject }),
        [object, dispatch],
    );

    const onOpacityChanged = React.useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', value: { ...object, opacity } as SceneObject });
            }
        },
        [object, dispatch],
    );

    const onSizeChanged = useSpinChanged(
        (brushSize: number) => dispatch({ type: 'update', value: { ...object, brushSize } as SceneObject }),
        [object, dispatch],
    );

    return (
        <Stack>
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <BrushSizeControl
                value={object.brushSize.toString()}
                color={object.color}
                opacity={object.opacity}
                onChange={onSizeChanged}
            />
            <ResizeableObjectProperties object={object} />
        </Stack>
    );
};

registerPropertiesControl<DrawObject>(ObjectType.Draw, DrawObjectEditControl);
