import { SceneObject } from '../scene';

export interface PropertiesControlProps<T> {
    objects: readonly (T & SceneObject)[];
}

export type PropertiesControl<T> = React.FC<PropertiesControlProps<T>>;
