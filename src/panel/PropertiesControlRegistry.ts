import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { asArray } from '../util';

export interface PropertiesControlProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type PropertiesControl<T extends SceneObject> = React.FC<PropertiesControlProps<T>>;

const registry = new Registry<PropertiesControlProps>();

export function registerPropertiesControl<T extends SceneObject>(
    ids: string | string[],
    component: PropertiesControl<T>,
): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
    }
}

export function getPropertiesControl(object: SceneObject) {
    return registry.get(object.type);
}
