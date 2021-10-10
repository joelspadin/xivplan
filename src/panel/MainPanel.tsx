import { IPivotStyles, IStyle, mergeStyleSets, Pivot, PivotItem } from '@fluentui/react';
import React from 'react';
import { ArenaPanel } from './ArenaPanel';
import { PANEL_WIDTH } from './PanelStyles';
import { PrefabsPanel } from './PrefabsPanel';
import { StatusPanel } from './StatusPanel';

const enum Tabs {
    Arena = 'arena',
    Objects = 'objects',
    Status = 'status',
    Draw = 'draw',
}

const classNames = mergeStyleSets({
    wrapper: {
        width: PANEL_WIDTH,
        userSelect: 'none',
        flexShrink: '0 !important',
    } as IStyle,
});

const pivotStyles: Partial<IPivotStyles> = {
    itemContainer: {
        maxHeight: 'calc(100% - 44px)',
        overflow: 'auto',
    },
};

export const MainPanel: React.FunctionComponent = () => {
    return (
        <Pivot className={classNames.wrapper} styles={pivotStyles}>
            <PivotItem headerText="Arena" itemKey={Tabs.Arena}>
                <ArenaPanel />
            </PivotItem>
            <PivotItem headerText="Object" itemKey={Tabs.Objects}>
                <PrefabsPanel />
            </PivotItem>
            <PivotItem headerText="Status" itemKey={Tabs.Status}>
                <StatusPanel />
            </PivotItem>
            <PivotItem headerText="Draw" itemKey={Tabs.Draw}>
                <p>TODO</p>
            </PivotItem>
        </Pivot>
    );
};
