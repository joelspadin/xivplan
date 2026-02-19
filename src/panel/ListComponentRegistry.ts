import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { asArray } from '../util';
import { DetailsItemSize } from './DetailsItem';

export interface ListComponentProps<T extends SceneObject = SceneObject> {
    object: T;
    isDragging?: boolean;
    isSelected?: boolean;
    showControls?: boolean;
    size?: DetailsItemSize;
}

export type ListComponent<T extends SceneObject> = React.FC<ListComponentProps<T>>;

const registry = new Registry<ListComponentProps>();

export function registerListComponent<T extends SceneObject>(
    ids: string | string[],
    component: ListComponent<T>,
): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
    }
}

export function getListComponent(object: SceneObject): React.FC<ListComponentProps<SceneObject>> {
    return registry.get(object.type);
}
