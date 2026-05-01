import type { SpinButtonChangeEvent, SpinButtonOnChangeData } from '@fluentui/react-components';

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export function useSpinChanged(callback: (value: number) => void) {
    return (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
        if (typeof data.value === 'number') {
            callback(data.value);
        }
    };
}
