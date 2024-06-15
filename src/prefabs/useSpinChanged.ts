import { SpinButtonChangeEvent, SpinButtonOnChangeData } from '@fluentui/react-components';

export function useSpinChanged(callback: (value: number) => void) {
    return (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
        if (typeof data.value === 'number') {
            callback(data.value);
        }
    };
}
