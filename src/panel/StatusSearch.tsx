import {
    Dropdown,
    Field,
    Option,
    SearchBox,
    Spinner,
    makeStyles,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync, useDebounce, useLocalStorage } from 'react-use';
import { PANEL_PADDING } from './PanelStyles';
import { StatusGrid, StatusItem } from './StatusGrid';

interface Pagination {
    Page: number;
    PageNext: number | null;
    PagePrev: number | null;
    PageTotal: number;
    Results: number;
    ResultsPerPage: number;
    ResultsTotal: number;
}

interface Page {
    Pagination: Pagination;
    Results: StatusItem[];
}

export type Language = 'en' | 'ja' | 'de' | 'fr';

const DEBOUNCE_TIME = 300;

const LANGUAGE_OPTIONS: Record<Language, string> = {
    ja: '日本語',
    en: 'English',
    fr: 'Français',
    de: 'Deutch',
};

export interface StatusSearchProps {
    filter: string;
    onFilterChanged: React.Dispatch<string>;
}

export const StatusSearch: React.FC<StatusSearchProps> = ({ filter, onFilterChanged }) => {
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

            {items.loading && <Spinner />}

            {!items.loading && items.value && items.value.length > 0 && (
                <StatusGrid items={items.value} columns={6} className={classes.list} />
            )}

            {!items.loading && debouncedFilter && items.value?.length === 0 && <p>No results.</p>}
        </div>
    );
};

const fetchStatuses = async (search: string, signal: AbortSignal, language: Language = 'en'): Promise<StatusItem[]> => {
    const items: StatusItem[] = [];

    let pageIndex: number | null = 1;

    do {
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

const useStyles = makeStyles({
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
    list: {
        maxHeight: `calc(100vh - 48px - 44px - 32px - 58px - 32px - 2 * ${tokens.spacingVerticalS} - ${PANEL_PADDING}px)`,
    },
});
