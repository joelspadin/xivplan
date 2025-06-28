import { Vector2d } from 'konva/lib/types';
import { createContext } from 'react';

export const DraggableCenterContext = createContext<Vector2d>({ x: 0, y: 0 });
