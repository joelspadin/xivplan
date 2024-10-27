import { createContext, Dispatch } from 'react';
import { Scene } from './scene';

export const DirtyContext = createContext(false);
export const SavedStateContext = createContext<Dispatch<Scene>>(() => undefined);
