import { Field, ToggleButton, Tooltip } from '@fluentui/react-components';
import {
    LinkAddRegular,
    LinkDismissRegular,
    LinkMultipleRegular,
    LockClosedRegular,
    LockMultipleRegular,
    LockOpenRegular,
} from '@fluentui/react-icons';
import React from 'react';
import { getObjectById, useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { getAllowedParentIds } from '../../connections';
import { getAbsolutePosition } from '../../coord';
import { EditMode } from '../../editMode';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { selectNone, selectSingle, useSpotlight } from '../../selection';
import { useConnectionSelection } from '../../useConnectionSelection';
import { useControlStyles } from '../../useControlStyles';
import { useEditMode } from '../../useEditMode';
import { commonValue, omit, setOrOmit } from '../../util';
import { getListComponent } from '../ListComponentRegistry';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { scene, step, dispatch } = useScene();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();
    const [, setSpotlight] = useSpotlight();

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

    const onMouseEnterParent = () => {
        setSpotlight(parentId === undefined ? selectNone() : selectSingle(parentId));
    };
    const onMouseLeaveParent = () => {
        setSpotlight(selectNone());
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

    const parentObject = parentId && getObjectById(scene, parentId);
    const ParentDisplayComponent = parentObject && getListComponent(parentObject);

    return (
        <>
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
            <div className={classes.row}>
                {ParentDisplayComponent && (
                    <Field label="Relative to:" onMouseEnter={onMouseEnterParent} onMouseLeave={onMouseLeaveParent}>
                        {
                            // (not really nested, but it removes the visiblity toggle and deletion button, and a smaller size is OK)
                            // https://github.com/facebook/react/issues/34794
                            // eslint-disable-next-line react-hooks/static-components
                            <ParentDisplayComponent isNested={true} object={parentObject} />
                        }
                    </Field>
                )}
            </div>
        </>
    );
};
