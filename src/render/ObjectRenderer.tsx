import React from 'react';
import { ObjectContext } from '../prefabs/ObjectContext';
import { SceneObject } from '../scene';
import { LayerName } from './layers';
import { getLayerName, getRenderer } from './ObjectRegistry';

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
                return (
                    <ObjectContext.Provider key={object.id} value={object}>
                        <Component object={object} />
                    </ObjectContext.Provider>
                );
            })}
        </>
    );
};
