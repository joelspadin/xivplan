import { Field, mergeClasses, ToggleButton, Tooltip } from '@fluentui/react-components';
import { EyeTrackingOffRegular, EyeTrackingRegular, LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { ConnectionType } from '../../EditModeContext';
import { getObjectById, useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { getAllowedRotationParentIds } from '../../connections';
import { getAbsoluteRotation } from '../../coord';
import { EditMode } from '../../editMode';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { EnemyObject, EnemyRingStyle, isEnemy, isMoveable, RotateableObject } from '../../scene';
import { selectNone, selectSingle, useSelection, useSpotlight } from '../../selection';
import { useConnectionSelection } from '../../useConnectionSelection';
import { useControlStyles } from '../../useControlStyles';
import { useEditMode } from '../../useEditMode';
import { commonValue, omit } from '../../util';
import { getListComponent } from '../ListComponentRegistry';
import { PropertiesControlProps } from '../PropertiesControl';

export const RotationControl: React.FC<PropertiesControlProps<RotateableObject | EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch, step, scene } = useScene();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();
    const [, setSelection] = useSelection();
    const [, setSpotlight] = useSpotlight();

    const rotation = commonValue(objects, (obj) => obj.rotation);
    const noDirection = commonValue(objects, (obj) => isEnemy(obj) && obj.ring == EnemyRingStyle.NoDirection);
    const facingId = commonValue(objects, (obj) => obj.facingId);
    const currentlyLinked = facingId !== undefined;

    const onRotationChanged = useSpinChanged((rotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, rotation })) }),
    );

    const allowedParentIds = getAllowedRotationParentIds(step, objects);
    const onToggleLinked = () => {
        if (currentlyLinked) {
            dispatch({
                type: 'update',
                value: objects.map((obj) => {
                    return {
                        ...omit(obj, 'facingId'),
                        rotation: isMoveable(obj) ? getAbsoluteRotation(scene, obj) : 0,
                    };
                }),
            });
        } else {
            if (allowedParentIds.length == 0) {
                return;
            }
            setEditMode(EditMode.SelectConnection);
            setConnectionSelection({
                objectIdsToConnect: objects.map((obj) => obj.id),
                connectionType: ConnectionType.ROTATION,
            });
        }
    };

    const linkedTooltip =
        allowedParentIds.length == 0
            ? 'No available link targets'
            : currentlyLinked
              ? 'Unlink rotation'
              : 'Face entity';

    const linkIcon = facingId === undefined ? <EyeTrackingRegular /> : <EyeTrackingOffRegular />;

    // TODO: share with position component
    const parentObject = facingId && getObjectById(scene, facingId);
    const ParentDisplayComponent = parentObject && getListComponent(parentObject);

    const onMouseEnterParent = () => {
        setSpotlight(facingId === undefined ? selectNone() : selectSingle(facingId));
    };
    const onMouseLeaveParent = () => {
        setSpotlight(selectNone());
    };
    function onClickParent(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        // Don't trigger the selection if modifiers are held
        if (facingId !== undefined && !event.ctrlKey && !event.shiftKey) {
            setSelection(selectSingle(facingId));
            // The element disappearing will not trigger an onMouseLeave
            setSpotlight(selectNone());
        }
    }

    return (
        <>
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <Field label={<RotationLabel currentlyLinked={currentlyLinked} />} className={classes.cell}>
                    <SpinButtonUnits
                        disabled={noDirection}
                        value={rotation}
                        onChange={onRotationChanged}
                        step={5}
                        fractionDigits={1}
                        suffix="°"
                    />
                </Field>

                <Tooltip content={linkedTooltip} relationship="label" withArrow>
                    <ToggleButton
                        checked={facingId !== undefined}
                        onClick={onToggleLinked}
                        icon={linkIcon}
                        disabled={allowedParentIds.length == 0}
                    />
                </Tooltip>
            </div>
            <div className={classes.row}>
                {ParentDisplayComponent && (
                    <Field
                        label="Rotation is relative to facing:"
                        onMouseEnter={onMouseEnterParent}
                        onMouseLeave={onMouseLeaveParent}
                        onClick={onClickParent}
                    >
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

interface RotationLabelProps {
    readonly currentlyLinked: boolean;
}

const RotationLabel: React.FC<RotationLabelProps> = ({ currentlyLinked }) => {
    return (
        <>
            Rotation
            {currentlyLinked && (
                <Tooltip content="Relative to 'facing' the object below" relationship="description">
                    <LinkRegular style={{ paddingLeft: '5px' }} />
                </Tooltip>
            )}
        </>
    );
};
