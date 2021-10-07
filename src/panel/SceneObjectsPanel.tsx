import { IStyle, mergeStyleSets } from '@fluentui/react';
import React, { useCallback } from 'react';
import { useScene } from '../SceneProvider';
import { SceneSelection, useSelection } from '../SelectionProvider';
import { ObjectList } from './ObjectList';
import { PANEL_PADDING } from './PanelStyles';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
        userSelect: 'none',
    } as IStyle,
});

function updateSelection(selection: SceneSelection, from: number, to: number): SceneSelection {
    return selection.map((i) => {
        if (i === from) {
            return to;
        }
        if (from < to) {
            if (i > from && i <= to) {
                return i - 1;
            }
        } else {
            if (i >= to && i < from) {
                return i + 1;
            }
        }

        return i;
    });
}

export const SceneObjectsPanel: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    const [selection, setSelection] = useSelection();

    const moveObject = useCallback(
        (from: number, to: number) => {
            dispatch({ type: 'move', from, to });
            setSelection(updateSelection(selection, from, to));
        },
        [dispatch, selection, setSelection],
    );

    return (
        <div className={classNames.root}>
            <ObjectList objects={scene.objects} onMove={moveObject} />
        </div>
    );
};
