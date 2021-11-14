import { generateFilter } from 'colorize-filter';

export function getRecolorFilter(color: string): string | undefined {
    return 'brightness(0) saturate(100%) ' + generateFilter(color);
}
