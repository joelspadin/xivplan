import { use } from 'react';
import { PanelDragContext, type PanelDragObject, type PanelDragState } from './PanelDragContext';
import { EditMode } from './editMode';
import { useEditMode } from './useEditMode';

export function usePanelDrag(): PanelDragState {
    const [dragObject, setDragObject] = use(PanelDragContext);
    const [, setEditMode] = useEditMode();

    const wrappedSet = (value: PanelDragObject | null) => {
        // Drag and dropping an object should cancel tether inputs.
        setEditMode(EditMode.Normal);
        setDragObject(value);
    };

    return [dragObject, wrappedSet];
}
