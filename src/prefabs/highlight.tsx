import { isMoveable, UnknownObject } from '../scene';
import { useSelection } from '../SelectionProvider';

function isPinned(object: UnknownObject) {
    if (isMoveable(object)) {
        return object.pinned ?? false;
    }
    return false;
}

export function useShowHighlight(object: UnknownObject, index: number): boolean {
    const [selection] = useSelection();
    return selection.has(index) && (selection.size > 1 || isPinned(object));
}

export function useShowResizer(object: UnknownObject, index: number): boolean {
    const [selection] = useSelection();
    return selection.has(index) && selection.size === 1 && !isPinned(object);
}
