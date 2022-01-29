import {
    DefaultFontStyles,
    FontWeights,
    IPivotStyles,
    IStyle,
    mergeStyleSets,
    Pivot,
    PivotItem,
    Separator,
    Stack,
} from '@fluentui/react';
import React from 'react';
import { useMedia } from 'react-use';
import { PANEL_PADDING, PANEL_WIDTH } from './PanelStyles';
import { PropertiesPanel } from './PropertiesPanel';
import { SceneObjectsPanel } from './SceneObjectsPanel';

const enum Tabs {
    Properties = 'props',
    Layers = 'layers',
}

const PROPERTIES_TITLE = 'Properties';
const OBJECTS_TITLE = 'Scene';

const headerStyle: IStyle[] = [
    DefaultFontStyles.mediumPlus,
    {
        fontWeight: FontWeights.semibold,
        paddingLeft: PANEL_PADDING,
        paddingRight: PANEL_PADDING,
    },
];

const classNames = mergeStyleSets({
    wrapper: {
        gridArea: 'right-panel',
        flexShrink: '0 !important',
        width: PANEL_WIDTH,
    } as IStyle,

    widePanel: {
        gridArea: 'right-panel',
        flexShrink: '0 !important',
        height: '100%',
        header: headerStyle,
        section: {
            width: PANEL_WIDTH,
            display: 'flex',
            flexFlow: 'column',
        } as IStyle,
    } as IStyle,

    tallPanel: {
        gridArea: 'right-panel',
        flexShrink: '0 !important',
        height: '100%',
        width: PANEL_WIDTH,
        header: headerStyle,
    } as IStyle,

    scrollable: {
        overflow: 'auto',
    } as IStyle,
});

const pivotStyles: Partial<IPivotStyles> = {
    itemContainer: {
        maxHeight: 'calc(100% - 44px)',
        overflow: 'auto',
    },
};

export const DetailsPanel: React.FC = () => {
    const isWide = useMedia(`(min-width: 1700px)`);
    const isTall = useMedia('(min-height: 900px)');

    if (isWide) {
        return <WideDetailsPanel />;
    }

    if (isTall) {
        return <TallDetailsPanel />;
    }

    return <ShortDetailsPanel />;
};

const WideDetailsPanel: React.FC = () => {
    return (
        <Stack horizontal className={classNames.widePanel}>
            <section>
                <header>{PROPERTIES_TITLE}</header>
                <div className={classNames.scrollable}>
                    <PropertiesPanel />
                </div>
            </section>
            <Separator vertical />
            <section>
                <header>{OBJECTS_TITLE}</header>
                <div className={classNames.scrollable}>
                    <SceneObjectsPanel />
                </div>
            </section>
        </Stack>
    );
};

const TallDetailsPanel: React.FC = () => {
    return (
        <Stack className={classNames.tallPanel}>
            <header>{PROPERTIES_TITLE}</header>
            <PropertiesPanel />
            <Separator />
            <header>{OBJECTS_TITLE}</header>
            <div className={classNames.scrollable}>
                <SceneObjectsPanel />
            </div>
        </Stack>
    );
};

const ShortDetailsPanel: React.FC = () => {
    return (
        <Pivot className={classNames.wrapper} styles={pivotStyles}>
            <PivotItem headerText={PROPERTIES_TITLE} itemKey={Tabs.Properties}>
                <PropertiesPanel />
            </PivotItem>
            <PivotItem headerText={OBJECTS_TITLE} itemKey={Tabs.Layers}>
                <SceneObjectsPanel />
            </PivotItem>
        </Pivot>
    );
};
