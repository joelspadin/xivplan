import { createContext, useContext } from 'react';
import { SceneObject } from '../scene';

export const DisplayObjectsContext = createContext<readonly SceneObject[]>([]);

export function useDisplayObjectsList(): readonly SceneObject[] {
    return useContext(DisplayObjectsContext);
}
