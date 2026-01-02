import { SplitButton, Tooltip } from '@fluentui/react-components';
import { bundleIcon, DismissFilled, DismissRegular, LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { getAllowedPositionParentIds, getAllowedRotationParentIds } from '../../connections';
import { getAbsolutePosition, getAbsoluteRotation } from '../../coord';
import { EditMode } from '../../editMode';
import { ConnectionType } from '../../EditModeContext';
import { isMoveable, isRotateable, SceneObject } from '../../scene';
import { getObjectById, useScene } from '../../SceneProvider';
import { selectNone, selectSingle, useSelection, useSpotlight } from '../../selection';
import { useConnectionSelection } from '../../useConnectionSelection';
import { useEditMode } from '../../useEditMode';
import { commonValue, omit } from '../../util';
import { getListComponent } from '../ListComponentRegistry';

export interface ParentObjectSelectorProps {
    readonly connectionType: ConnectionType;
    readonly objects: readonly SceneObject[];
}

export const ParentObjectSelector: React.FC<ParentObjectSelectorProps> = ({ connectionType, objects }) => {
    const { scene, step, dispatch } = useScene();
    const [, setSpotlight] = useSpotlight();
    const [, setSelection] = useSelection();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();

    const getParentId = (obj: SceneObject) => {
        if (isMoveable(obj) && connectionType == ConnectionType.POSITION) {
            return obj.parentId;
        }
        if (isRotateable(obj) && connectionType == ConnectionType.ROTATION) {
            return obj.facingId;
        }
    };
    const commonParentId = commonValue(objects, getParentId);
    const haveSharedLink = commonParentId !== undefined;
    const haveAnyLink = objects.find((obj) => getParentId(obj) !== undefined) !== undefined;

    let allowedParentIds: number[];
    switch (connectionType) {
        case ConnectionType.POSITION:
            allowedParentIds = getAllowedPositionParentIds(step, objects);
            break;
        case ConnectionType.ROTATION:
            allowedParentIds = getAllowedRotationParentIds(step, objects);
            break;
        default:
            allowedParentIds = [];
    }

    const parentObject = haveSharedLink && getObjectById(scene, commonParentId);
    const ParentDisplayComponent = parentObject && getListComponent(parentObject);

    const onMouseEnterParent = () => {
        setSpotlight(haveSharedLink ? selectSingle(commonParentId) : selectNone());
    };
    const onMouseLeaveParent = () => {
        setSpotlight(selectNone());
    };

    function onClickParent(event: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (haveSharedLink) {
            // Don't trigger the selection if modifiers are held
            if (!event.ctrlKey && !event.shiftKey) {
                setSelection(selectSingle(commonParentId));
                // The element disappearing will not trigger an onMouseLeave
                setSpotlight(selectNone());
            }
            return;
        } else {
            // For both "no current connections" and ""
            if (allowedParentIds.length == 0) {
                return;
            }
            setEditMode(EditMode.SelectConnection);
            setConnectionSelection({
                objectIdsToConnect: objects.map((obj) => obj.id),
                connectionType,
            });
        }
    }
    function onClickUnlink(): void {
        if (haveAnyLink) {
            switch (connectionType) {
                case ConnectionType.POSITION:
                    dispatch({
                        type: 'update',
                        value: objects.filter(isMoveable).map((obj) => {
                            const absolutePos = getAbsolutePosition(scene, obj);
                            return {
                                ...omit(obj, 'parentId'),
                                // Always unpin objects upon detaching them
                                pinned: false,
                                ...absolutePos,
                            };
                        }),
                    });
                    break;
                case ConnectionType.ROTATION:
                    dispatch({
                        type: 'update',
                        value: objects.filter(isRotateable).map((obj) => {
                            return {
                                ...omit(obj, 'facingId'),
                                rotation: isMoveable(obj) ? getAbsoluteRotation(scene, obj) : 0,
                            };
                        }),
                    });
                    break;
            }
        }
    }

    let newLinkText: string;
    let newLinkTooltip: string;
    let currentLinkTooltip: string;
    switch (connectionType) {
        case ConnectionType.POSITION:
            newLinkText = 'Link position';
            newLinkTooltip =
                allowedParentIds.length == 0
                    ? 'No available object to attach to'
                    : 'Attach the selection to another object';
            currentLinkTooltip = 'If this object moves, so does the selection';
            break;
        case ConnectionType.ROTATION:
            newLinkText = 'Face object';
            newLinkTooltip =
                allowedParentIds.length == 0
                    ? 'No available object to face'
                    : 'Automatically rotate towards another object';
            currentLinkTooltip = 'If this object moves, the selection will rotate to face it (plus the Rotation value)';
            break;
    }

    return (
        <SplitButton
            icon={<LinkRegular />}
            menuIcon={<UnlinkButton />}
            appearance="subtle"
            primaryActionButton={{
                onClick: onClickParent,
                onMouseEnter: onMouseEnterParent,
                onMouseLeave: onMouseLeaveParent,
                disabled: !haveAnyLink && allowedParentIds.length == 0,
            }}
            menuButton={{ onClick: onClickUnlink, disabled: !haveAnyLink }}
        >
            {haveSharedLink && ParentDisplayComponent && (
                <Tooltip content={currentLinkTooltip} relationship="description">
                    {
                        // https://github.com/facebook/react/issues/34794
                        // eslint-disable-next-line react-hooks/static-components
                        <ParentDisplayComponent isNested={true} object={parentObject} />
                    }
                </Tooltip>
            )}
            {haveSharedLink && !ParentDisplayComponent && 'Unknown object'}
            {!haveSharedLink && haveAnyLink && 'Multiple objects'}
            {!haveAnyLink && (
                <Tooltip content={newLinkTooltip} relationship="description">
                    <div>{newLinkText}</div>
                </Tooltip>
            )}
        </SplitButton>
    );
};

const UnlinkIcon = bundleIcon(DismissFilled, DismissRegular);

const UnlinkButton: React.FC = () => {
    return <UnlinkIcon />;
};
