import { IPivotStyles, IStyle, mergeStyleSets, Pivot, PivotItem } from '@fluentui/react';
import React, { useCallback } from 'react';
import { EditMode, useEditMode } from '../EditModeProvider';
import { ArenaPanel } from './ArenaPanel';
import { DrawPanel } from './DrawPanel';
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
    const [, setEditMode] = useEditMode();

    const onTabChanged = useCallback(
        (item?: PivotItem) => {
            // Cancel any special edit mode when changing tabs.
            // Draw tab should always default to draw mode.
            const newMode = item?.props.itemKey === Tabs.Draw ? EditMode.Draw : EditMode.Default;
            setEditMode(newMode);
        },
        [setEditMode],
    );

    return (
        <Pivot
            className={classNames.wrapper}
            styles={pivotStyles}
            defaultSelectedKey={Tabs.Objects}
            onLinkClick={onTabChanged}
        >
            <PivotItem headerText="Arena" itemKey={Tabs.Arena}>
                <ArenaPanel />
            </PivotItem>
            <PivotItem headerText="Objects" itemKey={Tabs.Objects}>
                <PrefabsPanel />
            </PivotItem>
            <PivotItem headerText="Status" itemKey={Tabs.Status}>
                <StatusPanel />
            </PivotItem>
            <PivotItem headerText="Draw" itemKey={Tabs.Draw}>
                <DrawPanel />
            </PivotItem>
        </Pivot>
    );
};
