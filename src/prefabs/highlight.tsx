import { isMoveable, UnknownObject } from '../scene';
import { useSelection } from '../SelectionProvider';

function isPinned(object: UnknownObject) {
    if (isMoveable(object)) {
        return object.pinned ?? false;
    }
    return false;
}

export function useShowHighlight(object: UnknownObject): boolean {
    const [selection] = useSelection();
    return selection.has(object.id) && (selection.size > 1 || isPinned(object));
}

export function useShowResizer(object: UnknownObject): boolean {
    const [selection] = useSelection();
    return selection.has(object.id) && selection.size === 1 && !isPinned(object);
}
