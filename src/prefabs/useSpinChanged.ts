import React, { DependencyList, useCallback } from 'react';

export function useSpinChanged(
    callback: (value: number) => void,
    deps: DependencyList,
): (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => void {
    return useCallback(
        (ev, newValue) => {
            if (newValue === undefined) {
                return;
            }

            const value = parseInt(newValue);
            if (isNaN(value)) {
                return;
            }

            callback(value);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, ...deps],
    );
}
