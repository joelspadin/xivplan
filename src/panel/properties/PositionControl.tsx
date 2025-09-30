import { Dropdown, Field, Option, ToggleButton, Tooltip } from '@fluentui/react-components';
import {
    LinkAddRegular,
    LinkDismissRegular,
    LinkMultipleRegular,
    LockClosedRegular,
    LockMultipleRegular,
    LockOpenRegular,
} from '@fluentui/react-icons';
import React from 'react';
import { getObjectById, getObjectNameById, useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { getAbsolutePosition, getRelativeAttachmentPoint } from '../../coord';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { getDefaultAttachmentPreference, isMoveable, MoveableObject, SceneObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue, omit, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { scene, step, dispatch } = useScene();

    const x = commonValue(objects, (obj) => obj.x);
    const y = commonValue(objects, (obj) => obj.y);
    const pinned = commonValue(objects, (obj) => !!obj.pinned);
    const parentId = commonValue(objects, (obj) => obj.parentId);

    const onTogglePinned = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'pinned', !pinned)) });

    const onXChanged = useSpinChanged((x: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, x })) }),
    );
    const onYChanged = useSpinChanged((y: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, y })) }),
    );

    const selectedAndChildren = new Set<number>(objects.map((obj) => obj.id));
    let addedObjects = objects.length;
    while (addedObjects > 0) {
        addedObjects = 0;
        step.objects.forEach((obj) => {
            if (selectedAndChildren.has(obj.id)) {
                return;
            }
            if (isMoveable(obj) && obj.parentId !== undefined && selectedAndChildren.has(obj.parentId)) {
                selectedAndChildren.add(obj.id);
                addedObjects++;
            }
        });
    }

    const allowedParentIds = step.objects
        .filter(isMoveable)
        .map((obj) => obj.id)
        .filter((id) => !selectedAndChildren.has(id));

    const dispatchNewParentId = (newParentId: number) => {
        dispatch({
            type: 'update',
            value: objects.map((obj) => {
                const absolutePos = getAbsolutePosition(scene, obj);
                // Markers and status effects go to the new default position. Anything else just stays where it is.
                const attachmentPreference = getDefaultAttachmentPreference(obj);
                const newRelativePos = getRelativeAttachmentPoint(
                    scene,
                    { ...obj, ...absolutePos },
                    getObjectById(scene, newParentId) as SceneObject & MoveableObject,
                    attachmentPreference,
                );
                return {
                    ...obj,
                    parentId: newParentId,
                    ...newRelativePos,
                };
            }),
        });
    };

    const onToggleLinked = () => {
        const currentlyLinked = parentId !== undefined;
        if (currentlyLinked) {
            dispatch({
                type: 'update',
                value: objects.map((obj) => {
                    const absolutePos = getAbsolutePosition(scene, obj);
                    return {
                        ...omit(obj, 'parentId'),
                        ...absolutePos,
                    };
                }),
            });
        } else {
            if (allowedParentIds.length == 0) {
                return;
            }
            // Pick the first allowed parent by default.
            dispatchNewParentId(allowedParentIds[0]!);
        }
    };

    const onParentChanged = (newValue?: string) => {
        if (!newValue) {
            // shouldn't happen since unselecting an item is not allowed.
            return;
        }
        dispatchNewParentId(parseInt(newValue));
    };

    const icon = pinned === undefined ? <LockMultipleRegular /> : pinned ? <LockClosedRegular /> : <LockOpenRegular />;
    const tooltip = pinned ? 'Unlock position' : 'Lock position';
    const linkedTooltip =
        allowedParentIds.length == 0
            ? 'No available link targets'
            : parentId !== undefined
              ? 'Unlink position'
              : 'Link position';

    const linkIcon =
        parentId === undefined ? (
            objects.length == 1 ? (
                <LinkAddRegular />
            ) : (
                <LinkMultipleRegular />
            )
        ) : (
            <LinkDismissRegular />
        );

    return (
        <>
            <div className={classes.row}>
                {parentId !== undefined && (
                    <Field label="Position linked to:">
                        <Dropdown
                            onOptionSelect={(_, data) => onParentChanged(data.optionValue)}
                            value={getObjectNameById(scene, parentId)}
                            selectedOptions={parentId === undefined ? [] : [parentId.toString()]}
                        >
                            {allowedParentIds.map((id) => (
                                <Option key={id.toString()} value={id.toString()}>
                                    {getObjectNameById(scene, id)!}
                                </Option>
                            ))}
                        </Dropdown>
                    </Field>
                )}
            </div>
            <div className={classes.row}>
                <Field label="X">
                    <SpinButton value={x} onChange={onXChanged} step={1} />
                </Field>
                <Field label="Y">
                    <SpinButton value={y} onChange={onYChanged} step={1} />
                </Field>
                <Tooltip content={tooltip} relationship="label" withArrow>
                    <ToggleButton checked={pinned || false} onClick={onTogglePinned} icon={icon} />
                </Tooltip>
                <Tooltip content={linkedTooltip} relationship="label" withArrow>
                    <ToggleButton
                        checked={parentId !== undefined}
                        onClick={onToggleLinked}
                        icon={linkIcon}
                        disabled={allowedParentIds.length == 0}
                    />
                </Tooltip>
            </div>
        </>
    );
};
