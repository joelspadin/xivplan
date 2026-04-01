import { createContext, type Dispatch } from 'react';
import type { Scene } from './scene';

export const DirtyContext = createContext(false);
export const SavedStateContext = createContext<Dispatch<Scene>>(() => undefined);
