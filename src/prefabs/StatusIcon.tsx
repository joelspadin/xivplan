import Konva from 'konva';
import React, { useEffect, useMemo, useState } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import useImage from 'use-image';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import { DEFAULT_IMAGE_OPACITY, SELECTED_PROPS } from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { IconObject, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { HideGroup } from './HideGroup';
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
            opacity: DEFAULT_IMAGE_OPACITY,
            ...object,
            ...position,
        } as IconObject,
    };
});

interface IconTimerProps {
    time: number;
    width: number;
    height: number;
}

const IconTimer: React.FC<IconTimerProps> = ({ time, width, height }) => {
    const text = useMemo(() => {
        if (time < 60) {
            return time.toString();
        }
        if (time < 3600) {
            return `${Math.floor(time / 60)}m`;
        }

        return `${Math.floor(time / 3600)}h`;
    }, [time]);

    const fontSize = Math.max(14, height / 3);
    const strokeWidth = Math.max(1, fontSize / 8);

    const [textNode, setTextNode] = useState<Konva.Text | null>(null);
    const [textWidth, setTextWidth] = useState(width);
    useEffect(() => {
        setTextWidth(textNode?.measureSize(text).width ?? width);
    }, [textNode, text, fontSize, width, setTextWidth]);

    if (time <= 0) {
        return null;
    }

    return (
        <Text
            ref={setTextNode}
            text={text}
            x={(width - textWidth) / 2}
            y={height * 0.8}
            width={textWidth}
            height={fontSize}
            align="center"
            fill="white"
            stroke="black"
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            fillAfterStrokeEnabled
        />
    );
};

const IconRenderer: React.FC<RendererProps<IconObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [image] = useImageTracked(object.image);

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
                    <HideGroup>
                        <KonvaImage image={image} width={object.width} height={object.height} />
                        <IconTimer time={object.time ?? 0} width={object.width} height={object.height} />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<IconObject>(ObjectType.Icon, LayerName.Default, IconRenderer);

const IconDetails: React.FC<ListComponentProps<IconObject>> = ({ object, ...props }) => {
    return <DetailsItem icon={object.image} name={object.name} object={object} {...props} />;
};

registerListComponent<IconObject>(ObjectType.Icon, IconDetails);

export interface StatusIconProps {
    name: string;
    icon: string;
    iconId?: number;
    maxStacks?: number;
    scale?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ name, icon, iconId, maxStacks, scale }) => {
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
            title={getTitle(name, maxStacks)}
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
                        iconId,
                        maxStacks,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

function getTitle(name: string, maxStacks: number | undefined) {
    if (!maxStacks) {
        return name;
    }

    return `${name} \u00D7${maxStacks}`;
}
