import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { asArray } from '../util';

export interface RendererProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type Renderer<T extends SceneObject> = React.FunctionComponent<RendererProps<T>>;

const registry = new Registry<RendererProps>();

export function registerRenderer<T extends SceneObject>(ids: string | string[], component: Renderer<T>): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
    }
}

export interface ObjectRendererProps {
    objects: readonly SceneObject[];
}

export const ObjectRenderer: React.FunctionComponent<ObjectRendererProps> = ({ objects }) => {
    return (
        <>
            {objects.map((object, key) => {
                const Component = registry.get(object.type);
                return <Component object={object} key={key} />;
            })}
        </>
    );
};
