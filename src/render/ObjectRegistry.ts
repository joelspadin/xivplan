import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { asArray } from '../util';
import { LayerName } from './layers';

export interface RendererProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type Renderer<T extends SceneObject> = React.FC<RendererProps<T>>;

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

export function getLayerName(object: SceneObject): LayerName | undefined {
    return layers[object.type];
}

export function getRenderer(object: SceneObject) {
    return registry.get(object.type);
}
