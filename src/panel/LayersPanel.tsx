import { IStyle, mergeStyleSets } from '@fluentui/react';
import React, { useCallback } from 'react';
import { useScene } from '../SceneProvider';
import { LayerList } from './LayerList';
import { PANEL_PADDING } from './PanelStyles';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
    } as IStyle,
});

export const LayersPanel: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();

    const moveTether = useCallback(
        (from: number, to: number) => dispatch({ type: 'tethers', op: 'move', from, to }),
        [dispatch],
    );

    const moveActor = useCallback(
        (from: number, to: number) => dispatch({ type: 'actors', op: 'move', from, to }),
        [dispatch],
    );

    const moveMarker = useCallback(
        (from: number, to: number) => dispatch({ type: 'markers', op: 'move', from, to }),
        [dispatch],
    );

    const moveZone = useCallback(
        (from: number, to: number) => dispatch({ type: 'zones', op: 'move', from, to }),
        [dispatch],
    );

    return (
        <div className={classNames.root}>
            <LayerList objects={scene.tethers} onMove={moveTether} layer="layer-tether" headerText="Tethers" />
            <LayerList objects={scene.actors} onMove={moveActor} layer="layer-actor" headerText="Party &amp; enemies" />
            <LayerList objects={scene.markers} onMove={moveMarker} layer="layer-waymark" headerText="Waymarks" />
            <LayerList objects={scene.zones} onMove={moveZone} layer="layer-zone" headerText="Zones" />
        </div>
    );
};
