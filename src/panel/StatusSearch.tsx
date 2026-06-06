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
import { useAsync, useDebouncedState, useLocalStorageValue } from '@react-hookz/web';
import { useEffect, useRef } from 'react';
import { MessageToast } from '../MessageToast';
import { PANEL_PADDING } from './PanelStyles';
import { StatusGrid, type StatusItem } from './StatusGrid';

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

const API_ENDPOINT = 'https://v2.xivapi.com/api';
const SEARCH_URL = `${API_ENDPOINT}/search`;
const ASSET_URL = `${API_ENDPOINT}/asset`;

const DEBOUNCE_TIME = 300;

const LANGUAGE_OPTIONS: Record<Language, string> = {
    ja: '日本語',
    en: 'English',
    fr: 'Français',
    de: 'Deutch',
};

const DEFAULT_LANGUAGE: Language = 'en';

export const StatusSearch: React.FC = () => {
    const classes = useStyles();
    const controllerRef = useRef<AbortController>(undefined);
    const { value: language, set: setLanguage } = useLocalStorageValue<Language>('language');
    const { dispatchToast } = useToastController();

    const [filter, setFilter] = useDebouncedState('', DEBOUNCE_TIME);

    const [items, { execute: fetchItems }] = useAsync(async (filter: string, language: Language) => {
        if (!filter) {
            return [];
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            return fetchStatuses(filter, controller.signal, language);
        } catch (ex) {
            console.warn(ex);
            dispatchToast(<MessageToast title="Error" message={ex} />, { intent: 'error' });
            return [];
        }
    });

    useEffect(() => {
        controllerRef.current?.abort();
        fetchItems(filter, language ?? DEFAULT_LANGUAGE);
    }, [fetchItems, filter, language]);

    return (
        <div className={classes.statusSearch}>
            <Field label="Language">
                <Dropdown
                    appearance="underline"
                    value={LANGUAGE_OPTIONS[language ?? DEFAULT_LANGUAGE]}
                    selectedOptions={[language as string]}
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
                onChange={(ev, data) => setFilter(data.value)}
            />

            {items.status === 'loading' && <Spinner />}

            {items.status !== 'loading' && items.result && items.result.length > 0 && (
                <StatusGrid items={items.result} columns={6} className={classes.list} />
            )}

            {items.status !== 'loading' && items.result?.length === 0 && <p>No results.</p>}
        </div>
    );
};

async function fetchStatuses(search: string, signal: AbortSignal, language: Language) {
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
