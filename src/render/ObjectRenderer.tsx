import React from 'react';
import { Group } from 'react-konva';
import { ObjectContext } from '../prefabs/ObjectContext';
import { SceneObject } from '../scene';
import { LayerName } from './layers';
import { getLayerName, getRenderer } from './ObjectRegistry';

export interface ObjectRendererProps {
    objects: readonly SceneObject[];
    layer: LayerName;
}

export const ObjectRenderer: React.FC<ObjectRendererProps> = ({ objects, layer }) => {
    return (
        <>
            {objects.map((object) => {
                if (getLayerName(object) !== layer) {
                    return null;
                }

                const Component = getRenderer(object);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const o = object as any;
                // _ceilOnly: entering objects from next step — disable hit-testing
                const ceilOnly = o._ceilOnly === true;
                // _pulseScale: snapshot animation — subtle size oscillation
                const pulseScale: number | undefined = o._pulseScale;
                // _pulseGlow: highlight animation — faint pulsing shadow glow
                const pulseGlow: number | undefined = o._pulseGlow;

                return (
                    <ObjectContext key={object.id} value={object}>
                        <Group
                            listening={!ceilOnly}
                            scaleX={pulseScale}
                            scaleY={pulseScale}
                            shadowEnabled={pulseGlow !== undefined}
                            shadowBlur={pulseGlow !== undefined ? 20 : undefined}
                            shadowColor="white"
                            shadowOpacity={pulseGlow}
                            shadowOffsetX={0}
                            shadowOffsetY={0}
                        >
                            <Component object={object} />
                        </Group>
                    </ObjectContext>
                );
            })}
        </>
    );
};
