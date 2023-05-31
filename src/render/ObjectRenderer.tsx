import React from 'react';
import { SceneObject } from '../scene';
import { getLayerName, getRenderer } from './ObjectRegistry';
import { LayerName } from './layers';

export interface ObjectRendererProps {
    objects: readonly SceneObject[];
    layer: LayerName;
}

export const ObjectRenderer: React.FC<ObjectRendererProps> = ({ objects, layer }) => {
    return (
        <>
            {objects.map((object) => {
                if (getLayerName(object) !== layer) {
                    return null;
                }

                const Component = getRenderer(object);
                return <Component key={object.id} object={object} />;
            })}
        </>
    );
};
