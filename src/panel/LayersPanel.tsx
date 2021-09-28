import { IStyle, mergeStyleSets } from '@fluentui/react';
import React, { useCallback } from 'react';
import { EditList, useScene } from '../SceneProvider';
import { SceneSelection, useSelection } from '../SelectionProvider';
import { LayerList } from './LayerList';
import { PANEL_PADDING } from './PanelStyles';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
        userSelect: 'none',
    } as IStyle,
});

function updateSelection(selection: SceneSelection, from: number, to: number): SceneSelection {
    if (selection.index === from) {
        return { ...selection, index: to };
    }
    if (from < to) {
        if (selection.index > from && selection.index <= to) {
            return { ...selection, index: selection.index - 1 };
        }
    } else {
        if (selection.index >= to && selection.index < from) {
            return { ...selection, index: selection.index + 1 };
        }
    }

    return selection;
}

export const LayersPanel: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    const [selection, setSelection] = useSelection();

    const moveObject = useCallback(
        (type: EditList, from: number, to: number) => {
            dispatch({ type, op: 'move', from, to });

            // If an object in the reordered list is selected, the selection
            // index needs to be updated to maintain the selection.
            if (selection?.layer === type) {
                setSelection(updateSelection(selection, from, to));
            }
        },
        [dispatch, selection, setSelection],
    );

    const moveTether = useCallback((from: number, to: number) => moveObject('tethers', from, to), [moveObject]);
    const moveActor = useCallback((from: number, to: number) => moveObject('actors', from, to), [moveObject]);
    const moveMarker = useCallback((from: number, to: number) => moveObject('markers', from, to), [moveObject]);
    const moveZone = useCallback((from: number, to: number) => moveObject('zones', from, to), [moveObject]);

    return (
        <div className={classNames.root}>
            <LayerList objects={scene.tethers} onMove={moveTether} layer="tethers" headerText="Tethers" />
            <LayerList objects={scene.actors} onMove={moveActor} layer="actors" headerText="Party &amp; enemies" />
            <LayerList objects={scene.markers} onMove={moveMarker} layer="markers" headerText="Waymarks" />
            <LayerList objects={scene.zones} onMove={moveZone} layer="zones" headerText="Zones" />
        </div>
    );
};
