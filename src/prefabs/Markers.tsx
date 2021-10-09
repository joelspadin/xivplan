import { IChoiceGroupOption, IStackTokens, Stack } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Ellipse, Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { CompactColorPicker } from '../CompactColorPicker';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { ALIGN_TO_PIXEL } from '../render/coord';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { GroundPortal } from '../render/Portals';
import { SELECTED_PROPS } from '../render/SceneTheme';
import { MarkerObject, ObjectType } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsSelected } from '../SelectionProvider';
import { ImageObjectProperties } from './CommonProperties';
import { DraggableObject } from './DraggableObject';
import { PrefabIcon } from './PrefabIcon';

const DEFAULT_SIZE = 42;
const ICON_RATIO = 32 / DEFAULT_SIZE;

const COLOR_RED = '#f13b66';
const COLOR_YELLOW = '#e1dc5d';
const COLOR_BLUE = '#65b3ea';
const COLOR_PURPLE = '#e291e6';

function makeIcon(name: string, icon: string, shape: 'circle' | 'square', color: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = new URL(`../assets/marker/${icon}`, import.meta.url).toString();

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Marker,
                            image: iconUrl,
                            name,
                            color,
                            shape,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

registerDropHandler<MarkerObject>(ObjectType.Marker, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Marker,
            name: '',
            image: '',
            shape: 'square',
            color: COLOR_RED,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

function getDashSize(object: MarkerObject) {
    switch (object.shape) {
        case 'square':
            return (object.width + object.height) / 2 / 8;

        case 'circle': {
            const a = object.width / 2;
            const b = object.height / 2;
            const perimiter = 2 * Math.PI * Math.sqrt((a * a + b * b) / 2);
            return perimiter / 24;
        }
    }
}

const MarkerRenderer: React.FC<RendererProps<MarkerObject>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const [image] = useImage(object.image);

    const iconWidth = object.width * ICON_RATIO;
    const iconHeight = object.height * ICON_RATIO;

    const dashSize = getDashSize(object);
    const strokeProps = {
        stroke: object.color,
        strokeWidth: 1,
        shadowColor: object.color,
        shadowBlur: 2,
        dash: [dashSize, dashSize],
    };

    const highlightWidth = object.width + strokeProps.strokeWidth * 4;
    const highlightHeight = object.height + strokeProps.strokeWidth * 4;

    return (
        <GroundPortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                <Group rotation={object.rotation}>
                    {object.shape === 'circle' && (
                        <>
                            {isSelected && (
                                <Ellipse
                                    radiusX={highlightWidth / 2}
                                    radiusY={highlightHeight / 2}
                                    {...SELECTED_PROPS}
                                />
                            )}

                            <Ellipse radiusX={object.width / 2} radiusY={object.height / 2} {...strokeProps} />
                        </>
                    )}
                    {object.shape === 'square' && (
                        <>
                            {isSelected && (
                                <Rect
                                    x={-highlightWidth / 2}
                                    y={-highlightHeight / 2}
                                    width={highlightWidth}
                                    height={highlightHeight}
                                    {...SELECTED_PROPS}
                                    {...ALIGN_TO_PIXEL}
                                />
                            )}

                            <Rect
                                x={-object.width / 2}
                                y={-object.height / 2}
                                width={object.width}
                                height={object.height}
                                dashOffset={dashSize / 2}
                                {...strokeProps}
                                {...ALIGN_TO_PIXEL}
                            />
                        </>
                    )}
                    <Image
                        image={image}
                        width={iconWidth}
                        height={iconHeight}
                        offsetX={iconWidth / 2}
                        offsetY={iconHeight / 2}
                    />
                </Group>
            </DraggableObject>
        </GroundPortal>
    );
};

registerRenderer<MarkerObject>(ObjectType.Marker, MarkerRenderer);

const MarkerDetails: React.FC<ListComponentProps<MarkerObject>> = ({ object, index }) => {
    return <DetailsItem icon={object.image} name={object.name} index={index} />;
};

registerListComponent<MarkerObject>(ObjectType.Marker, MarkerDetails);

const shapeOptions: IChoiceGroupOption[] = [
    { key: 'circle', text: 'Circle', iconProps: { iconName: 'CircleRing' } },
    { key: 'square', text: 'Square', iconProps: { iconName: 'Checkbox' } },
];

const swatches = [COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_PURPLE];

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const MarkerEditControl: React.FC<PropertiesControlProps<MarkerObject>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = useCallback(
        (newName?: string) => dispatch({ type: 'update', index, value: { ...object, name: newName ?? '' } }),
        [dispatch, object, index],
    );

    const onShapeChanged = useCallback(
        (option?: IChoiceGroupOption) => {
            const shape = (option?.key as 'circle' | 'square') ?? 'square';
            dispatch({ type: 'update', index, value: { ...object, shape } });
        },
        [dispatch, object, index],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />

            <Stack horizontal tokens={stackTokens}>
                <CompactColorPicker label="Color" color={object.color} swatches={swatches} onChange={onColorChanged} />
                <CompactChoiceGroup
                    label="Shape"
                    options={shapeOptions}
                    selectedKey={object.shape}
                    onChange={(ev, option) => onShapeChanged(option)}
                />
            </Stack>
            <ImageObjectProperties object={object} index={index} />
        </Stack>
    );
};

registerPropertiesControl<MarkerObject>(ObjectType.Marker, MarkerEditControl);

export const WaymarkA = makeIcon('Waymark A', 'waymark_a.png', 'circle', COLOR_RED);
export const WaymarkB = makeIcon('Waymark B', 'waymark_b.png', 'circle', COLOR_YELLOW);
export const WaymarkC = makeIcon('Waymark C', 'waymark_c.png', 'circle', COLOR_BLUE);
export const WaymarkD = makeIcon('Waymark D', 'waymark_d.png', 'circle', COLOR_PURPLE);
export const Waymark1 = makeIcon('Waymark 1', 'waymark_1.png', 'square', COLOR_RED);
export const Waymark2 = makeIcon('Waymark 2', 'waymark_2.png', 'square', COLOR_YELLOW);
export const Waymark3 = makeIcon('Waymark 3', 'waymark_3.png', 'square', COLOR_BLUE);
export const Waymark4 = makeIcon('Waymark 4', 'waymark_4.png', 'square', COLOR_PURPLE);
