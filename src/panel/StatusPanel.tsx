import {
    FocusZone,
    FocusZoneDirection,
    IStyle,
    List,
    mergeStyleSets,
    Pivot,
    PivotItem,
    ProgressIndicator,
    SearchBox,
} from '@fluentui/react';
import React, { useCallback, useState } from 'react';
import { useAsync, useDebounce } from 'react-use';
import { StatusEdenBlue, StatusEdenOrange, StatusEdenYellow } from '../prefabs/Status';
import { StatusIcon } from '../prefabs/StatusIcon';
import { PANEL_PADDING } from './PanelStyles';
import { ObjectGroup, Section } from './Section';

const classNames = mergeStyleSets({
    panel: {
        padding: PANEL_PADDING,
    } as IStyle,
    search: {
        marginTop: PANEL_PADDING,
        marginLeft: PANEL_PADDING,
        marginRight: PANEL_PADDING,
    } as IStyle,
    list: {
        marginTop: PANEL_PADDING,
        paddingLeft: PANEL_PADDING,
        paddingRight: PANEL_PADDING,
        // TODO: is there a way to make this less terrible?
        maxHeight: 'calc(100vh - 44px - 44px - 48px - 61px - 8px - 8px)',
        overflow: 'auto',
    } as IStyle,
    listItem: {
        width: 32,
        height: 32,
        float: 'left',
        margin: 5,
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

export const StatusPanel: React.FC = () => {
    const [filter, setFilter] = useState('');

    return (
        <Pivot>
            <PivotItem headerText="Search">
                <StatusSearch filter={filter} onFilterChanged={setFilter} />
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
    return (
        <div className={classNames.listItem}>
            <StatusIcon name={item.Name} icon={`https://xivapi.com${item.Icon}`} />
        </div>
    );
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

interface StatusSearchProps {
    filter: string;
    onFilterChanged: React.Dispatch<string>;
}

const StatusSearch: React.FC<StatusSearchProps> = ({ filter, onFilterChanged }) => {
    const [controller, setController] = useState<AbortController>();
    const [debouncedFilter, setDebouncedFilter] = useState('');

    const setFilter = useCallback(
        (text?: string) => {
            controller?.abort();
            onFilterChanged(text ?? '');
        },
        [controller, onFilterChanged],
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

    return (
        <FocusZone direction={FocusZoneDirection.vertical}>
            <SearchBox
                className={classNames.search}
                placeholder="Status name"
                value={filter}
                onChange={(ev, text) => setFilter(text)}
            />
            <div className={classNames.list}>
                <List items={items.value ?? []} onRenderCell={onRenderCell} />

                {items.loading && <ProgressIndicator />}
                {!items.loading && filter && items.value?.length === 0 && <p>No results.</p>}
            </div>
        </FocusZone>
    );
};

const SpecialStatus: React.FC = () => {
    return (
        <div className={classNames.panel}>
            <Section title="Eden">
                <ObjectGroup>
                    <StatusEdenYellow />
                    <StatusEdenOrange />
                    <StatusEdenBlue />
                </ObjectGroup>
            </Section>
        </div>
    );
};
