import { EditList, SceneAction } from './SceneProvider';
import { SceneSelection } from './SelectionProvider';

export function getDeleteAction(layer: EditList, index: number): SceneAction {
    switch (layer) {
        case 'actors':
            return { type: 'actors', op: 'remove', index };

        case 'markers':
            return { type: 'markers', op: 'remove', index };

        case 'tethers':
            return { type: 'tethers', op: 'remove', index };

        case 'zones':
            return { type: 'zones', op: 'remove', index };
    }
}

export function getDeleteSelectionAction(selection: SceneSelection): SceneAction {
    return getDeleteAction(selection.layer, selection.index);
}
