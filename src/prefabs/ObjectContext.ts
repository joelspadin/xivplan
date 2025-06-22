import { createContext } from 'react';
import { ObjectType, SceneObject } from '../scene';

export const ObjectContext = createContext<SceneObject>({ type: ObjectType.Undefined, opacity: 0, id: -1 });
