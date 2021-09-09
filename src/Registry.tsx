import React from 'react';

export class Registry<T = unknown> {
    private components: Record<string, React.FunctionComponent<T>> = {};

    register<U extends T>(id: string, component: React.FunctionComponent<U>): void {
        this.components[id] = component as React.FunctionComponent<T>;
    }

    get(id: string): React.FunctionComponent<T> {
        return this.components[id] ?? (() => null);
    }
}
