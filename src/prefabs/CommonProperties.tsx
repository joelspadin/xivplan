import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { DependencyList, useCallback } from 'react';
import { DeferredTextField } from '../DeferredTextField';
import { ImageObject, Point, ResizeableObject, UnknownObject } from '../scene';
import { EditList, updateListObject, useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

export interface ObjectPropertiesProps<T> {
    object: T & UnknownObject;
    layer: EditList;
    index: number;
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

export const MoveableObjectProperties: React.FC<ObjectPropertiesProps<Point>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onXChanged = useSpinChanged(
        (x: number) => updateListObject(dispatch, layer, index, { ...object, x }),
        [dispatch, object, layer, index],
    );
    const onYChanged = useSpinChanged(
        (y: number) => updateListObject(dispatch, layer, index, { ...object, y }),
        [dispatch, object, layer, index],
    );

    return (
        <>
            <Stack horizontal tokens={stackTokens}>
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
            </Stack>
        </>
    );
};

export const ResizeableObjectProperties: React.FC<ObjectPropertiesProps<ResizeableObject>> = ({
    object,
    layer,
    index,
}) => {
    const [, dispatch] = useScene();

    const onWidthChanged = useSpinChanged(
        (width: number) => updateListObject(dispatch, layer, index, { ...object, width }),
        [dispatch, object, layer, index],
    );
    const onHeightChanged = useSpinChanged(
        (height: number) => updateListObject(dispatch, layer, index, { ...object, height }),
        [dispatch, object, layer, index],
    );
    const onRotationChanged = useSpinChanged(
        (rotation: number) => updateListObject(dispatch, layer, index, { ...object, rotation: rotation % 360 }),
        [dispatch, object, layer, index],
    );

    return (
        <>
            <MoveableObjectProperties object={object} layer={layer} index={index} />
            <Stack horizontal tokens={stackTokens}>
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

export const ImageObjectProperties: React.FC<ObjectPropertiesProps<ImageObject>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onImageChanged = useCallback(
        (image?: string) => updateListObject(dispatch, layer, index, { ...object, image: image ?? '' }),
        [dispatch, object, layer, index],
    );

    return (
        <>
            <DeferredTextField label="Image URL" value={object.image} onChange={onImageChanged} />
            <ResizeableObjectProperties object={object} layer={layer} index={index} />
        </>
    );
};
