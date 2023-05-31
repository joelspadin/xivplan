import Konva from 'konva';
import React from 'react';

export const StageContext = React.createContext<Konva.Stage | null>(null);
