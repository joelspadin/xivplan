import { IRectangle, List } from '@fluentui/react';
import {
    Dropdown,
    Field,
    Option,
    SearchBox,
    Spinner,
    Tab,
    TabList,
    makeStyles,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync, useDebounce, useLocalStorage } from 'react-use';
import {
    StatusAttack1,
    StatusAttack2,
    StatusAttack3,
    StatusAttack4,
    StatusAttack5,
    StatusAttack6,
    StatusAttack7,
    StatusAttack8,
    StatusBind1,
    StatusBind2,
    StatusBind3,
    StatusBlueCircleTarget,
    StatusCircle,
    StatusCounter1,
    StatusCounter2,
    StatusCounter3,
    StatusCounter4,
    StatusCounter5,
    StatusCounter6,
    StatusCounter7,
    StatusCounter8,
    StatusCross,
    StatusCrosshairs,
    StatusDice1,
    StatusDice2,
    StatusDice3,
    StatusEdenBlue,
    StatusEdenOrange,
    StatusEdenYellow,
    StatusGreenCircleTarget,
    StatusGreenTarget,
    StatusIgnore1,
    StatusIgnore2,
    StatusRedTarget,
    StatusSquare,
    StatusTriangle,
    StatusUltimateCircle,
    StatusUltimateCross,
    StatusUltimateSquare,
    StatusUltimateTriangle,
} from '../prefabs/Status';
import { StatusIcon } from '../prefabs/StatusIcon';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING } from './PanelStyles';
import { ObjectGroup, Section } from './Section';

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

type Language = 'en' | 'ja' | 'de' | 'fr';

export const StatusPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState('markers');
    const [filter, setFilter] = useState('');

    return (
        <div className={classes.panel}>
            <TabList size="small" selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as string)}>
                <Tab value="markers">Markers</Tab>
                <Tab value="status">Status effects</Tab>
            </TabList>
            {tab === 'markers' && <SpecialStatus />}
            {tab === 'status' && <StatusSearch filter={filter} onFilterChanged={setFilter} />}
        </div>
    );
};

const DEBOUNCE_TIME = 300;

const fetchStatuses = async (search: string, signal: AbortSignal, language: Language = 'en'): Promise<StatusItem[]> => {
    const items: StatusItem[] = [];

    let pageIndex: number | null = 1;

    do {
        console.log('fetching page', pageIndex, items);

        const params = new URLSearchParams({
            language,
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

const LANGUAGE_OPTIONS: Record<Language, string> = {
    ja: '日本語',
    en: 'English',
    fr: 'Français',
    de: 'Deutch',
};

interface StatusSearchProps {
    filter: string;
    onFilterChanged: React.Dispatch<string>;
}

const ROWS_PER_PAGE = 4;
const ITEM_SIZE = 32;
const ITEM_MARGIN = 10;

const getItemCountForPage = (itemIndex?: number, surfaceRect?: IRectangle) => {
    if (!surfaceRect) {
        return 0;
    }

    const columns = Math.floor(surfaceRect.width / (ITEM_SIZE + ITEM_MARGIN));

    return columns * ROWS_PER_PAGE;
};

const getPageHeight = () => (ITEM_SIZE + ITEM_MARGIN) * ROWS_PER_PAGE;

const StatusSearch: React.FC<StatusSearchProps> = ({ filter, onFilterChanged }) => {
    const classes = useStyles();
    const [controller, setController] = useState<AbortController>();
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');

    const selectedLanguage = useMemo(() => [language as string], [language]);

    const setFilter = useCallback(
        (text?: string) => {
            controller?.abort();
            onFilterChanged(text ?? '');
        },
        [controller, onFilterChanged],
    );

    const [, cancel] = useDebounce(() => setDebouncedFilter(filter), DEBOUNCE_TIME, [filter]);
    useEffect(() => {
        return cancel;
    }, [cancel]);

    const items = useAsync(async () => {
        if (!debouncedFilter) {
            return [];
        }

        const controller = new AbortController();
        setController(controller);

        try {
            return fetchStatuses(debouncedFilter, controller.signal, language);
        } catch (ex) {
            console.warn(ex);
            return [];
        }
    }, [debouncedFilter, language]);

    const onRenderCell = useCallback(
        (item?: StatusItem): JSX.Element | null => {
            if (!item) {
                return null;
            }
            return (
                <div className={classes.listItem}>
                    <StatusIcon name={item.Name} icon={`https://xivapi.com${item.Icon}`} />
                </div>
            );
        },
        [classes],
    );

    return (
        // TODO: replace with tabster? https://tabster.io/docs/mover
        // <FocusZone direction={FocusZoneDirection.vertical}>
        <div className={classes.statusSearch}>
            <Field label="Language">
                <Dropdown
                    appearance="underline"
                    value={LANGUAGE_OPTIONS[language ?? 'en']}
                    selectedOptions={selectedLanguage}
                    onOptionSelect={(ev, data) => setLanguage(data.optionValue as Language)}
                >
                    {Object.entries(LANGUAGE_OPTIONS).map(([lang, text]) => (
                        <Option key={lang} value={lang} text={text}>
                            {text}
                        </Option>
                    ))}
                </Dropdown>
            </Field>
            <SearchBox
                className={classes.search}
                appearance="underline"
                type="text"
                placeholder="Status name"
                value={filter}
                onChange={(ev, data) => setFilter(data.value)}
            />

            {/* TODO: migrate list once implemented, or replace with virtualizer? */}
            {/* https://github.com/orgs/microsoft/projects/786/views/1?pane=issue&itemId=24404181 */}
            <div className={classes.listWrapper}>
                {items.loading && <Spinner />}
                {!items.loading && (
                    <List
                        items={items.value ?? []}
                        onRenderCell={onRenderCell}
                        getItemCountForPage={getItemCountForPage}
                        getPageHeight={getPageHeight}
                        renderedWindowsAhead={4}
                    />
                )}

                {!items.loading && debouncedFilter && items.value?.length === 0 && <p>No results.</p>}
            </div>
        </div>
    );
};

const SpecialStatus: React.FC = () => {
    const classes = useControlStyles();

    return (
        <div className={classes.panel}>
            <Section title="General">
                <ObjectGroup>
                    <StatusAttack1 />
                    <StatusAttack2 />
                    <StatusAttack3 />
                    <StatusAttack4 />
                    <StatusAttack5 />
                    <StatusAttack6 />
                    <StatusAttack7 />
                    <StatusAttack8 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusIgnore1 />
                    <StatusIgnore2 />
                    <StatusBind1 />
                    <StatusBind2 />
                    <StatusBind3 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusTriangle />
                    <StatusCircle />
                    <StatusCross />
                    <StatusSquare />
                </ObjectGroup>
            </Section>
            <Section title="Counters">
                <ObjectGroup>
                    <StatusCounter1 />
                    <StatusCounter2 />
                    <StatusCounter3 />
                    <StatusCounter4 />
                    <StatusCounter5 />
                    <StatusCounter6 />
                    <StatusCounter7 />
                    <StatusCounter8 />
                </ObjectGroup>
            </Section>
            <Section title="Target indicators">
                <ObjectGroup>
                    <StatusBlueCircleTarget />
                    <StatusGreenCircleTarget />
                    <StatusCrosshairs />
                    <StatusRedTarget />
                    <StatusGreenTarget />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusUltimateTriangle />
                    <StatusUltimateCircle />
                    <StatusUltimateCross />
                    <StatusUltimateSquare />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusEdenYellow />
                    <StatusEdenOrange />
                    <StatusEdenBlue />
                </ObjectGroup>
            </Section>
            <Section title="Status effects">
                <ObjectGroup>
                    <StatusDice1 />
                    <StatusDice2 />
                    <StatusDice3 />
                </ObjectGroup>
            </Section>
        </div>
    );
};

const useStyles = makeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        overflow: 'hidden',
    },

    statusSearch: {
        ...shorthands.padding(`${PANEL_PADDING}px`, `${PANEL_PADDING}px`, 0),
        display: 'flex',
        flexFlow: 'column',
        flexGrow: 1,
        gap: tokens.spacingVerticalS,
    },
    search: {
        width: '100%',
        overflow: 'hidden',
    },
    listWrapper: {
        // TODO: is there a way to make this less terrible?
        height: `calc(100vh - 48px - 44px - 32px - 58px - 32px - 2 * ${tokens.spacingVerticalS} - ${PANEL_PADDING}px)`,
        overflowY: 'auto',

        marginLeft: `-${PANEL_PADDING}px`,
        marginRight: `-${PANEL_PADDING}px`,
    },
    listItem: {
        float: 'left',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${ITEM_SIZE}px`,
        height: `${ITEM_SIZE}px`,
        margin: `${ITEM_MARGIN / 2}px`,
    },
});
