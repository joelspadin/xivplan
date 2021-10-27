import { IStackTokens, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import lineIcon from '../../assets/zone/line.png';
import squareIcon from '../../assets/zone/square.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useIsGroupSelected } from '../../SelectionProvider';
import { setOrOmit } from '../../util';
import { ResizeableObjectProperties } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { HollowToggle } from './HollowToggle';
import { getZoneStyle } from './style';

const NAME = 'Rectangle';

const DEFAULT_SQUARE_SIZE = 150;

export const ZoneSquare: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={squareIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_SQUARE_SIZE,
                        height: DEFAULT_SQUARE_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

const DEFAULT_LINE_WIDTH = 50;
const DEFAULT_LINE_HEIGHT = 250;

export const ZoneLine: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Line AOE"
            icon={lineIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_LINE_WIDTH,
                        height: DEFAULT_LINE_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
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
            width: DEFAULT_SQUARE_SIZE,
            height: DEFAULT_SQUARE_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RectangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object, index }) => {
    const showHighlight = useIsGroupSelected(index);

    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow),
        [object],
    );

    const highlightWidth = object.width + style.strokeWidth;
    const highlightHeight = object.height + style.strokeWidth;

    return (
        <ResizeableObjectContainer object={object} index={index}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {showHighlight && (
                        <Rect
                            offsetX={style.strokeWidth / 2}
                            offsetY={style.strokeWidth / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            rotation={object.rotation}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <Rect width={object.width} height={object.height} {...style} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={squareIcon} name={NAME} index={index} />;
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);

function supportsHollow(object: RectangleZone) {
    return [ObjectType.Rect, ObjectType.Triangle, ObjectType.RightTriangle].includes(object.type);
}

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const RectangleEditControl: React.FC<PropertiesControlProps<RectangleZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onHollowChanged = useCallback(
        (hollow: boolean) => dispatch({ type: 'update', index, value: setOrOmit(object, 'hollow', hollow) }),
        [dispatch, object, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', index, value: { ...object, opacity } });
            }
        },
        [dispatch, object, index],
    );

    return (
        <Stack>
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item grow>
                    <CompactColorPicker
                        label="Color"
                        color={object.color}
                        swatches={COLOR_SWATCHES}
                        onChange={onColorChanged}
                    />
                </Stack.Item>
                {supportsHollow(object) && (
                    <HollowToggle label="Style" checked={object.hollow} onChange={onHollowChanged} />
                )}
            </Stack>
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <ResizeableObjectProperties object={object} index={index} />
        </Stack>
    );
};

registerPropertiesControl<RectangleZone>(
    [
        ObjectType.Rect,
        ObjectType.LineStack,
        ObjectType.LineKnockback,
        ObjectType.LineKnockAway,
        ObjectType.Triangle,
        ObjectType.RightTriangle,
    ],
    RectangleEditControl,
);
