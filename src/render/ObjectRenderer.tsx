import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { asArray } from '../util';
import { LayerName } from './layers';

export interface RendererProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type Renderer<T extends SceneObject> = React.FunctionComponent<RendererProps<T>>;

const registry = new Registry<RendererProps>();
const layers: Record<string, LayerName> = {};

export function registerRenderer<T extends SceneObject>(
    ids: string | string[],
    layer: LayerName,
    component: Renderer<T>,
): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
        layers[id] = layer;
    }
}

export interface ObjectRendererProps {
    objects: readonly SceneObject[];
    layer: LayerName;
}

export const ObjectRenderer: React.FunctionComponent<ObjectRendererProps> = ({ objects, layer }) => {
    return (
        <>
            {objects.map((object) => {
                if (layers[object.type] !== layer) {
                    return null;
                }

                const Component = registry.get(object.type);
                return <Component key={object.id} object={object} />;
            })}
        </>
    );
};
