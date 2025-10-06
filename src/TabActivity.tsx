import { Activity, PropsWithChildren } from 'react';

export interface TabActivityProps<T> extends PropsWithChildren {
    /** The identifier for this tab */
    value: T;
    /** The identifier for the tab that is currently active */
    activeTab: T;
}

/**
 * <Activity> but with a nicer interface for tabs.
 */
export function TabActivity<T>({ value, activeTab, children }: TabActivityProps<T>) {
    return <Activity mode={activeTab === value ? 'visible' : 'hidden'}>{children}</Activity>;
}
