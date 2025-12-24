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
import { getAllowedParentIds, updateParentIdsAction } from '../../connections';
import { getAbsolutePosition } from '../../coord';
import { EditMode } from '../../editMode';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { isMoveable, MoveableObject } from '../../scene';
import { useConnectionSelection } from '../../useConnectionSelection';
import { useControlStyles } from '../../useControlStyles';
import { useEditMode } from '../../useEditMode';
import { commonValue, omit, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { scene, step, dispatch } = useScene();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();

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

    const allowedParentIds = getAllowedParentIds(step, objects);

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
            setEditMode(EditMode.SelectConnection);
            setConnectionSelection({ objectIdsToConnect: objects.map((obj) => obj.id) });
        }
    };

    const onParentChanged = (newValue?: string) => {
        if (!newValue) {
            // shouldn't happen since unselecting an item is not allowed.
            return;
        }
        const newParentObject = getObjectById(scene, parseInt(newValue));
        if (!newParentObject || !isMoveable(newParentObject)) {
            // Shouldn't happen given the possible values in the dropdown
            return;
        }
        dispatch(updateParentIdsAction(scene, objects, newParentObject));
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
