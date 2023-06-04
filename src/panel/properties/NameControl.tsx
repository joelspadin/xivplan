import React, { useCallback, useMemo } from 'react';
import { DeferredTextField } from '../../DeferredTextField';
import { useScene } from '../../SceneProvider';
import { NamedObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const NameControl: React.FC<PropertiesControlProps<NamedObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const name = useMemo(() => commonValue(objects, (obj) => obj.name), [objects]);

    const onNameChanged = useCallback(
        (name: string | undefined) =>
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, name: name ?? '' })) }),
        [dispatch, objects],
    );

    return <DeferredTextField label="Name" value={name} onChange={onNameChanged} />;
};
