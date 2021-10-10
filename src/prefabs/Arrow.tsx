import { Stack } from '@fluentui/react';
import Konva from 'konva';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import * as React from 'react';
import { Arrow, Group, Rect } from 'react-konva';
import icon from '../assets/marker/arrow.png';
import { CompactColorPicker } from '../CompactColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { ActivePortal } from '../render/Portals';
import { COLOR_SWATCHES, SELECTED_PROPS } from '../render/SceneTheme';
import { ArrowObject, ObjectType } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsSelected } from '../SelectionProvider';
import { ResizeableObjectProperties } from './CommonProperties';
import { DraggableObject } from './DraggableObject';
import { PrefabIcon } from './PrefabIcon';

const NAME = 'Arrow';

const DEFAULT_ARROW_WIDTH = 20;
const DEFAULT_ARROW_HEIGHT = 150;
const DEFAULT_ARROW_COLOR = '#000000';
const DEFAULT_ARROW_OPACITY = 100;

export const MarkerArrow: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Arrow,
                        width: DEFAULT_ARROW_WIDTH,
                        height: DEFAULT_ARROW_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<ArrowObject>(ObjectType.Arrow, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Arrow,
            color: DEFAULT_ARROW_COLOR,
            opacity: DEFAULT_ARROW_OPACITY,
            width: DEFAULT_ARROW_WIDTH,
            height: DEFAULT_ARROW_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const ArrowRenderer: React.FC<RendererProps<ArrowObject>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = React.useState(false);

    const points = [0, object.height / 2, 0, -object.height / 2];
    const strokeWidth = object.width / 5;

    const arrowProps: ArrowConfig = {
        points: points,
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        pointerLength: object.width,
        pointerWidth: object.width * 0.8,
        strokeWidth,
        lineCap: 'round',
        pointerAtEnding: true,
    };

    // Cache so overlapping shapes with opacity appear as one object.
    const groupRef = React.useRef<Konva.Group>(null);
    React.useEffect(() => {
        groupRef.current?.cache();
    }, [object.width, object.height, object.rotation, object.color, object.opacity, isSelected, groupRef]);

    return (
        <ActivePortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                <Group opacity={object.opacity / 100} ref={groupRef}>
                    <Rect
                        width={object.width}
                        height={object.height}
                        offsetX={object.width / 2}
                        offsetY={object.height / 2}
                        fill="transparent"
                    />
                    {isSelected && (
                        <Arrow
                            {...arrowProps}
                            {...SELECTED_PROPS}
                            strokeWidth={strokeWidth + (SELECTED_PROPS.strokeWidth ?? 0)}
                        />
                    )}

                    <Arrow {...arrowProps} fill={object.color} stroke={object.color} />
                </Group>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<ArrowObject>(ObjectType.Arrow, LayerName.Default, ArrowRenderer);

const ArrowDetails: React.FC<ListComponentProps<ArrowObject>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
};

registerListComponent<ArrowObject>(ObjectType.Arrow, ArrowDetails);

const ArrowEditControl: React.FC<PropertiesControlProps<ArrowObject>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onColorChanged = React.useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onOpacityChanged = React.useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', index, value: { ...object, opacity } });
            }
        },
        [dispatch, object, index],
    );

    return (
        <Stack>
            <CompactColorPicker
                label="Color"
                color={object.color}
                swatches={COLOR_SWATCHES}
                onChange={onColorChanged}
            />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <ResizeableObjectProperties object={object} index={index} />
        </Stack>
    );
};

registerPropertiesControl<ArrowObject>(ObjectType.Arrow, ArrowEditControl);
