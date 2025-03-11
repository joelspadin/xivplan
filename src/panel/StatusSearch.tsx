import {
    Dropdown,
    Field,
    Option,
    SearchBox,
    Spinner,
    makeStyles,
    shorthands,
    tokens,
    useToastController,
} from '@fluentui/react-components';
import { useCallback, useMemo, useState } from 'react';
import { useAsync, useDebounce, useLocalStorage } from 'react-use';
import { MessageToast } from '../MessageToast';
import { PANEL_PADDING } from './PanelStyles';
import { StatusGrid, StatusItem } from './StatusGrid';

interface Result {
    score: number;
    sheet: string;
    row_id: number;
    fields: {
        Name: string;
        MaxStacks: number;
        Icon: {
            id: number;
            path_hr1: string;
        };
    };
}

interface Page {
    schema: string;
    results: Result[];
    next?: string;
}

export type Language = 'en' | 'ja' | 'de' | 'fr';

const API_ENDPOINT = 'https://beta.xivapi.com/api/1';
const SEARCH_URL = `${API_ENDPOINT}/search`;
const ASSET_URL = `${API_ENDPOINT}/asset`;

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
    const { dispatchToast } = useToastController();

    const selectedLanguage = useMemo(() => [language as string], [language]);

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
            return fetchStatuses(debouncedFilter, controller.signal, language);
        } catch (ex) {
            console.warn(ex);
            dispatchToast(<MessageToast title="Error" message={ex} />, { intent: 'error' });
            return [];
        }
    }, [debouncedFilter, language, dispatchToast]);

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

async function fetchStatuses(search: string, signal: AbortSignal, language: Language = 'en') {
    const items: StatusItem[] = [];
    let cursor: string | undefined = undefined;

    do {
        const params = new URLSearchParams({
            language,
            sheets: 'Status',
            fields: 'Name,Icon,MaxStacks',
            query: `Name~"${search}"`,
            ...(cursor && { cursor }),
        });

        const response = await fetch(`${SEARCH_URL}?${params}`, { cache: 'force-cache', signal });
        const page = (await response.json()) as Page;
        cursor = page.next;

        items.push(...page.results.map(getStatusIcon));
    } while (cursor);

    return items;
}

function getStatusIcon({ fields }: Result) {
    return {
        name: fields.Name,
        maxStacks: fields.MaxStacks,
        icon: {
            id: fields.Icon.id,
            url: getIconUrl(fields.Icon.path_hr1),
        },
    };
}

function getIconUrl(path: string) {
    return `${ASSET_URL}/${path}?format=png`;
}

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
