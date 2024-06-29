import React from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { SELECTED_PROPS } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { IconObject, ObjectType } from '../scene';
import { usePanelDrag } from '../usePanelDrag';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useShowHighlight } from './highlight';

const DEFAULT_SIZE = 32;

registerDropHandler<IconObject>(ObjectType.Icon, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Icon,
            image: '',
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        } as IconObject,
    };
});

const IconRenderer: React.FC<RendererProps<IconObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [image] = useImage(object.image);

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {showHighlight && (
                        <Rect
                            width={object.width}
                            height={object.height}
                            cornerRadius={(object.width + object.height) / 2 / 5}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <KonvaImage image={image} width={object.width} height={object.height} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<IconObject>(ObjectType.Icon, LayerName.Default, IconRenderer);

const IconDetails: React.FC<ListComponentProps<IconObject>> = ({ object, isNested }) => {
    return <DetailsItem icon={object.image} name={object.name} object={object} isNested={isNested} />;
};

registerListComponent<IconObject>(ObjectType.Icon, IconDetails);

export interface StatusIconProps {
    name: string;
    icon: string;
    scale?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ name, icon, scale }) => {
    const [, setDragObject] = usePanelDrag();
    const [image] = useImage(icon);

    scale = scale ?? 1;
    let { width, height } = image ?? {};

    if (width) {
        width /= scale;
    }
    if (height) {
        height /= scale;
    }

    return (
        <PrefabIcon
            draggable
            name={name}
            icon={icon}
            width={width}
            height={height}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Icon,
                        image: icon,
                        name,
                        width,
                        height,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};
