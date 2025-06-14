import { SceneObject } from '../scene';

export interface PropertiesControlProps<T> {
    objects: readonly (T & SceneObject)[];
    className?: string;
}

export type PropertiesControl<T> = React.FC<PropertiesControlProps<T>>;
