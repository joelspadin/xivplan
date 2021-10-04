import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';

export interface RendererProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type Renderer<T extends SceneObject> = React.FunctionComponent<RendererProps<T>>;

const registry = new Registry<RendererProps>();

export function registerRenderer<T extends SceneObject>(ids: string | string[], component: Renderer<T>): void {
    ids = Array.isArray(ids) ? ids : [ids];
    for (const id of ids) {
        registry.register(id, component);
    }
}

export interface ObjectRendererProps {
    objects: SceneObject[];
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
