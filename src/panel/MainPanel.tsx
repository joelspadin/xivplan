import { IPivotStyles, IStyle, mergeStyleSets, Pivot, PivotItem } from '@fluentui/react';
import React from 'react';
import { ArenaPanel } from './ArenaPanel';
import { ObjectsPanel } from './ObjectsPanel';
import { PANEL_WIDTH } from './PanelStyles';
import { StatusPanel } from './StatusPanel';

const enum Tabs {
    Arena = 'arena',
    Objects = 'objects',
    Status = 'status',
}

const classNames = mergeStyleSets({
    wrapper: {
        width: PANEL_WIDTH,
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
            <PivotItem headerText="Objects" itemKey={Tabs.Objects}>
                <ObjectsPanel />
            </PivotItem>
            <PivotItem headerText="Statuses" itemKey={Tabs.Status}>
                <StatusPanel />
            </PivotItem>
        </Pivot>
    );
};
