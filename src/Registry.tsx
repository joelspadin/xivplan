import React from 'react';

export class Registry<T = unknown> {
    private components: Record<string, React.FC<T>> = {};

    register<U extends T>(id: string, component: React.FC<U>): void {
        this.components[id] = component as React.FC<T>;
    }

    get(id: string): React.FC<T> {
        return this.components[id] ?? (() => null);
    }
}
