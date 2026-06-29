import React, { memo } from 'react';
import { Group } from 'react-konva';
import { usePulseTime } from '../playback/PlaybackContext';
import { ObjectContext } from '../prefabs/ObjectContext';
import { PulseStyle, SceneObject } from '../scene';
import { LayerName } from './layers';
import { getLayerName, getRenderer } from './ObjectRegistry';

export interface ObjectRendererProps {
    objects: readonly SceneObject[];
    layer: LayerName;
}

function getPulse(object: SceneObject): PulseStyle {
    return (object as { animation?: { pulse?: PulseStyle } }).animation?.pulse ?? 'none';
}

interface ObjectGroupProps {
    object: SceneObject;
    listening: boolean;
}

// Subscribes to PulseTimeContext — only instances of this component re-render at 60fps.
const PulsingObjectGroup: React.FC<ObjectGroupProps> = ({ object, listening }) => {
    const pulseTime = usePulseTime();
    const Component = getRenderer(object);
    const pulse = getPulse(object);

    let opacity: number | undefined;
    let scaleX: number | undefined;
    let scaleY: number | undefined;
    let shadowEnabled: boolean | undefined;
    let shadowBlur: number | undefined;
    let shadowOpacity: number | undefined;

    if (pulse === 'pulse') {
        // Sine wave opacity: 0.4–1.0, ~1 Hz
        opacity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(pulseTime * Math.PI * 2));
    } else if (pulse === 'blink') {
        // Square wave opacity: fully on/off at ~1.5 Hz
        opacity = (pulseTime * 3) % 1 < 0.5 ? 1 : 0;
    } else if (pulse === 'snapshot') {
        // Subtle size pulse (~2.5 Hz, ±3%)
        const s = 1 + 0.03 * Math.sin(pulseTime * Math.PI * 5);
        scaleX = s;
        scaleY = s;
    } else if (pulse === 'highlight') {
        // Faint pulsing glow (~1 Hz)
        shadowEnabled = true;
        shadowBlur = 20;
        shadowOpacity = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(pulseTime * Math.PI * 2));
    }

    return (
        <Group
            listening={listening}
            opacity={opacity}
            scaleX={scaleX}
            scaleY={scaleY}
            shadowEnabled={shadowEnabled}
            shadowBlur={shadowBlur}
            shadowColor="white"
            shadowOpacity={shadowOpacity}
            shadowOffsetX={0}
            shadowOffsetY={0}
        >
            <Component object={object} />
        </Group>
    );
};

// memo'd — skips re-render when the object reference hasn't changed.
const StaticObjectGroup = memo(function StaticObjectGroup({ object, listening }: ObjectGroupProps) {
    const Component = getRenderer(object);
    return (
        <Group listening={listening}>
            <Component object={object} />
        </Group>
    );
});

export const ObjectRenderer: React.FC<ObjectRendererProps> = ({ objects, layer }) => {
    return (
        <>
            {objects.map((object) => {
                if (getLayerName(object) !== layer) {
                    return null;
                }

                // _ceilOnly: entering objects from next step — disable hit-testing
                const ceilOnly = (object as { _ceilOnly?: boolean })._ceilOnly === true;
                const listening = !ceilOnly;
                const hasPulse = getPulse(object) !== 'none';

                return (
                    <ObjectContext key={object.id} value={object}>
                        {hasPulse ? (
                            <PulsingObjectGroup object={object} listening={listening} />
                        ) : (
                            <StaticObjectGroup object={object} listening={listening} />
                        )}
                    </ObjectContext>
                );
            })}
        </>
    );
};
