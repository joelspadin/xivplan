import React from 'react';
import { ScenePreview } from '../render/SceneRenderer';
import { ArenaShape, GridType, type Arena, type Scene, type SceneObjectPrototype } from '../scene';
import { getObjectPreviewPosition, getObjectPreviewSize } from './objectDragUtil';

export interface ObjectDragPreviewProps {
    object: SceneObjectPrototype;
}

export const ObjectDragPreview: React.FC<ObjectDragPreviewProps> = ({ object }) => {
    const size = getObjectPreviewSize(object);
    const position = getObjectPreviewPosition(object);

    const arena: Arena = {
        shape: ArenaShape.None,
        width: size.x,
        height: size.y,
        padding: 0,
        grid: { type: GridType.None },
    };

    const scene: Scene = {
        arena,
        nextId: 0,
        steps: [
            {
                objects: [{ id: 0, ...object, ...position }],
            },
        ],
    };

    return (
        <ScenePreview scene={scene} arena={arena} width={size.x} height={size.y} backgroundColor="transparent" simple />
    );
};
