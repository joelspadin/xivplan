import { IconButton, IStackTokens, IStyle, mergeStyleSets, Position, SpinButton, Stack } from '@fluentui/react';
import React, { DependencyList, useCallback } from 'react';
import { DeferredTextField } from '../DeferredTextField';
import { ImageObject, MoveableObject, ResizeableObject, SceneObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { setOrOmit } from '../util';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const classNames = mergeStyleSets({
    sizeRow: {
        marginRight: 32 + 10,
    } as IStyle,
});

export interface ObjectPropertiesProps<T> {
    object: T & UnknownObject;
}

export function useSpinChanged(
    callback: (value: number) => void,
    deps: DependencyList,
): (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => void {
    return useCallback((ev, newValue) => {
        if (newValue === undefined) {
            return;
        }

        const value = parseInt(newValue);
        if (isNaN(value)) {
            return;
        }

        callback(value);
    }, deps);
}

export const MoveableObjectProperties: React.FC<ObjectPropertiesProps<MoveableObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onTogglePinned = useCallback(
        () => dispatch({ type: 'update', value: setOrOmit(object, 'pinned', !object.pinned) as SceneObject }),
        [dispatch, object],
    );

    const onXChanged = useSpinChanged(
        (x: number) => dispatch({ type: 'update', value: { ...object, x } as SceneObject }),
        [dispatch, object],
    );
    const onYChanged = useSpinChanged(
        (y: number) => dispatch({ type: 'update', value: { ...object, y } as SceneObject }),
        [dispatch, object],
    );

    const iconName = object.pinned ? 'LockSolid' : 'UnlockSolid';

    return (
        <>
            <Stack horizontal tokens={stackTokens} verticalAlign="end">
                <SpinButton
                    label="X"
                    labelPosition={Position.top}
                    value={object.x.toString()}
                    onChange={onXChanged}
                    step={10}
                />
                <SpinButton
                    label="Y"
                    labelPosition={Position.top}
                    value={object.y.toString()}
                    onChange={onYChanged}
                    step={10}
                />
                <IconButton
                    iconProps={{ iconName }}
                    checked={object.pinned}
                    onClick={onTogglePinned}
                    title="Lock object"
                />
            </Stack>
        </>
    );
};

export const ResizeableObjectProperties: React.FC<ObjectPropertiesProps<ResizeableObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onWidthChanged = useSpinChanged(
        (width: number) => dispatch({ type: 'update', value: { ...object, width } as SceneObject }),
        [dispatch, object],
    );
    const onHeightChanged = useSpinChanged(
        (height: number) => dispatch({ type: 'update', value: { ...object, height } as SceneObject }),
        [dispatch, object],
    );
    const onRotationChanged = useSpinChanged(
        (rotation: number) =>
            dispatch({ type: 'update', value: { ...object, rotation: rotation % 360 } as SceneObject }),
        [dispatch, object],
    );

    return (
        <>
            <MoveableObjectProperties object={object} />
            <Stack horizontal tokens={stackTokens} className={classNames.sizeRow}>
                <SpinButton
                    label="Width"
                    labelPosition={Position.top}
                    value={object.width.toString()}
                    onChange={onWidthChanged}
                    min={20}
                    step={10}
                />
                <SpinButton
                    label="Height"
                    labelPosition={Position.top}
                    value={object.height.toString()}
                    onChange={onHeightChanged}
                    min={20}
                    step={10}
                />
            </Stack>
            <SpinButtonUnits
                label="Rotation"
                labelPosition={Position.top}
                value={object.rotation.toString()}
                onChange={onRotationChanged}
                step={15}
                suffix="°"
            />
        </>
    );
};

// TODO: allow list of preset images
export const ImageObjectProperties: React.FC<ObjectPropertiesProps<ImageObject>> = ({ object }) => {
    const { dispatch } = useScene();

    const onImageChanged = useCallback(
        (image?: string) => dispatch({ type: 'update', value: { ...object, image: image ?? '' } as SceneObject }),
        [dispatch, object],
    );

    return (
        <>
            <DeferredTextField label="Image URL" value={object.image} onChange={onImageChanged} />
            <ResizeableObjectProperties object={object} />
        </>
    );
};
