import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { Scene, SceneObject } from './scene';
import { EditList, useScene } from './SceneProvider';

export interface SceneSelection {
    layer: EditList;
    index: number;
}

export type SelectionState = [SceneSelection | undefined, Dispatch<SetStateAction<SceneSelection | undefined>>];

export const SelectionContext = createContext<SelectionState>([undefined, () => undefined]);

export const SelectionProvider: React.FC = ({ children }) => {
    const state = useState<SceneSelection | undefined>(undefined);

    return <SelectionContext.Provider value={state}>{children}</SelectionContext.Provider>;
};

export function useSelection(): SelectionState {
    return useContext(SelectionContext);
}

function getSelectedObject(scene: Scene, selection: SceneSelection): SceneObject | undefined {
    switch (selection.layer) {
        case 'actors':
            return scene.actors[selection.index];
        case 'markers':
            return scene.markers[selection.index];
        case 'tethers':
            return scene.tethers[selection.index];
        case 'zones':
            return scene.zones[selection.index];
    }
}

export interface SelectedObject extends SceneSelection {
    object: SceneObject;
    layer: EditList;
    index: number;
}

export function useSelectedObject(): SelectedObject | undefined {
    const [scene] = useScene();
    const [selection] = useSelection();

    if (!selection) {
        return undefined;
    }

    const object = getSelectedObject(scene, selection);
    if (!object) {
        return undefined;
    }

    return { object, ...selection };
}
