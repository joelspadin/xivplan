import { useCallback, useContext } from 'react';
import { PanelDragContext, PanelDragObject, PanelDragState } from './PanelDragProvider';
import { EditMode } from './editMode';
import { useEditMode } from './useEditMode';

export function usePanelDrag(): PanelDragState {
    const [dragObject, setDragObject] = useContext(PanelDragContext);
    const [, setEditMode] = useEditMode();

    const wrappedSet = useCallback(
        (value: PanelDragObject | null) => {
            // Drag and dropping an object should cancel tether inputs.
            setEditMode(EditMode.Normal);
            setDragObject(value);
        },
        [setDragObject, setEditMode],
    );

    return [dragObject, wrappedSet];
}
