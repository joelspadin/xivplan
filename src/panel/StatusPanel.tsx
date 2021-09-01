import {
    FocusZone,
    FocusZoneDirection,
    IStyle,
    List,
    mergeStyleSets,
    Pivot,
    PivotItem,
    ProgressIndicator,
    TextField,
} from '@fluentui/react';
import React, { useCallback, useState } from 'react';
import { useAsync, useDebounce } from 'react-use';
import { StatusEdenBlue, StatusEdenOrange, StatusEdenYellow } from '../prefabs/Status';
import { StatusIcon } from '../prefabs/StatusIcon';
import { PANEL_PADDING } from './PanelStyles';
import { Section } from './Section';

const classNames = mergeStyleSets({
    panel: {
        padding: PANEL_PADDING,
    } as IStyle,
    search: {
        marginTop: PANEL_PADDING,
        paddingLeft: PANEL_PADDING,
        paddingRight: PANEL_PADDING,
    } as IStyle,
    list: {
        marginTop: PANEL_PADDING,
        paddingLeft: PANEL_PADDING,
        paddingRight: PANEL_PADDING,
        // TODO: is there a way to make this less terrible?
        maxHeight: 'calc(100vh - 44px - 44px - 48px - 61px - 8px - 8px)',
        overflow: 'auto',
    } as IStyle,
});

interface Pagination {
    Page: number;
    PageNext: number | null;
    PagePrev: number | null;
    PageTotal: number;
    Results: number;
    ResultsPerPage: number;
    ResultsTotal: number;
}

interface StatusItem {
    ID: number;
    Icon: string;
    Name: string;
}

interface Page {
    Pagination: Pagination;
    Results: StatusItem[];
}

export const StatusPanel: React.FunctionComponent = () => {
    return (
        <Pivot>
            <PivotItem headerText="Buffs/debuffs">
                <StatusSearch />
            </PivotItem>
            <PivotItem headerText="Special markers">
                <SpecialStatus />
            </PivotItem>
        </Pivot>
    );
};

const DEBOUNCE_TIME = 300;

const onRenderCell = (item?: StatusItem): JSX.Element | null => {
    if (!item) {
        return null;
    }
    return <StatusIcon name={item.Name} icon={`https://xivapi.com${item.Icon}`} />;
};

const fetchStatuses = async (search: string, signal: AbortSignal): Promise<StatusItem[]> => {
    const items: StatusItem[] = [];

    let pageIndex: number | null = 1;

    do {
        const params = new URLSearchParams({
            indexes: 'Status',
            string: search,
            page: pageIndex.toString(),
        });
        const response = await fetch(`https://xivapi.com/search?${params}`, { signal });
        const page = (await response.json()) as Page;

        items.push(...page.Results);

        pageIndex = page.Pagination.PageNext;
    } while (pageIndex !== null);

    return items;
};

const StatusSearch: React.FunctionComponent = () => {
    const [controller, setController] = useState<AbortController>();
    const [filter, _setFilter] = useState('');
    const [debouncedFilter, setDebouncedFilter] = useState('');

    const setFilter = useCallback(
        (text?: string) => {
            controller?.abort();
            _setFilter(text ?? '');
        },
        [controller, _setFilter],
    );

    useDebounce(() => setDebouncedFilter(filter), DEBOUNCE_TIME, [filter]);

    const items = useAsync(async () => {
        if (!debouncedFilter) {
            return [];
        }

        const controller = new AbortController();
        setController(controller);

        try {
            return fetchStatuses(debouncedFilter, controller.signal);
        } catch (ex) {
            console.warn(ex);
            return [];
        }
    }, [debouncedFilter]);

    const itemCount = items.value?.length ? ` (${items.value.length} results)` : '';

    return (
        <FocusZone direction={FocusZoneDirection.vertical}>
            <TextField
                label={`Status name${itemCount}`}
                iconProps={{ iconName: 'Search' }}
                onChange={(ev, text) => setFilter(text)}
                className={classNames.search}
            />
            <div className={classNames.list}>
                <List items={items.value ?? []} onRenderCell={onRenderCell} />

                {items.loading && <ProgressIndicator />}
                {!items.loading && items.value?.length === 0 && <p>No results.</p>}
            </div>
        </FocusZone>
    );
};

const SpecialStatus: React.FunctionComponent = () => {
    return (
        <div className={classNames.panel}>
            <Section title="Eden">
                <StatusEdenYellow />
                <StatusEdenOrange />
                <StatusEdenBlue />
            </Section>
        </div>
    );
};
