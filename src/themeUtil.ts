import { CSSProperties } from 'react';

export function themeToCssVars<T extends object>(theme: T): Record<keyof T, `--${string}`> {
    const vars = {} as Record<keyof T, `--${string}`>;
    const keys = Object.keys(theme) as (keyof T)[];

    for (const key of keys) {
        vars[key] = `--xiv-${String(key)}`;
    }

    return vars;
}

export function themeToTokensObject<T extends object>(theme: T): Record<keyof T, string> {
    const tokens = {} as Record<keyof T, string>;
    const keys = Object.keys(theme) as (keyof T)[];

    for (const key of keys) {
        tokens[key] = `var(--xiv-${String(key)})`;
    }

    return tokens;
}

export function themeToCssProperties<T extends object>(theme: T): CSSProperties {
    return Object.fromEntries(
        (Object.entries(theme) as [keyof T, unknown][]).map(([name, value]) => {
            if (typeof value !== 'string' && typeof value !== 'number') {
                throw new TypeError('Theme values must be string | number');
            }

            return [`--xiv-${String(name)}`, value];
        }),
    );
}

export function cssPropertiesToStyleString(selector: string, styles: CSSProperties) {
    const vars = (Object.keys(styles) as (keyof typeof styles)[]).reduce((result, cssVar) => {
        return `${result}${cssVar}: ${styles[cssVar]}; `;
    }, '');

    return `${selector} {${vars}}`;
}
