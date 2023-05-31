import { useCallback, useContext } from 'react';
import { EditMode } from './EditModeProvider';
import { PanelDragContext, PanelDragObject, PanelDragState } from './PanelDragProvider';
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
