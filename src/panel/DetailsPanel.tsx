import { IPivotStyles, IStyle, mergeStyleSets, Pivot, PivotItem } from '@fluentui/react';
import React from 'react';
import { LayersPanel } from './LayersPanel';
import { PANEL_WIDTH } from './PanelStyles';

const enum Tabs {
    Properties = 'props',
    Layers = 'layers',
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

export const DetailsPanel: React.FunctionComponent = () => {
    return (
        <Pivot className={classNames.wrapper} styles={pivotStyles}>
            <PivotItem headerText="Properties" itemKey={Tabs.Properties}>
                <p>TODO</p>
            </PivotItem>
            <PivotItem headerText="Layers" itemKey={Tabs.Layers}>
                <LayersPanel />
            </PivotItem>
        </Pivot>
    );
};
