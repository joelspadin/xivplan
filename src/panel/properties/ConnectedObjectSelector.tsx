import { SplitButton, tokens, Tooltip } from '@fluentui/react-components';
import { bundleIcon, DismissFilled, DismissRegular, LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { getAllowedPositionParentIds, getAllowedRotationConnectionIds } from '../../connections';
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

export interface ConnectedObjectSelectorProps {
    readonly connectionType: ConnectionType;
    readonly objects: readonly SceneObject[];
}

export const ConnectedObjectSelector: React.FC<ConnectedObjectSelectorProps> = ({ connectionType, objects }) => {
    const { scene, step, dispatch } = useScene();
    const [, setSpotlight] = useSpotlight();
    const [, setSelection] = useSelection();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();

    const getConnectionId = (obj: SceneObject) => {
        if (isMoveable(obj) && connectionType == ConnectionType.POSITION) {
            return obj.positionParentId;
        }
        if (isRotateable(obj) && connectionType == ConnectionType.ROTATION) {
            return obj.facingId;
        }
    };
    const commonConnectionId = commonValue(objects, getConnectionId);
    const haveSharedLink = commonConnectionId !== undefined;
    const haveAnyLink = objects.find((obj) => getConnectionId(obj) !== undefined) !== undefined;

    let allowedConnectionIds: number[];
    switch (connectionType) {
        case ConnectionType.POSITION:
            allowedConnectionIds = getAllowedPositionParentIds(step, objects);
            break;
        case ConnectionType.ROTATION:
            allowedConnectionIds = getAllowedRotationConnectionIds(step, objects);
            break;
        default:
            allowedConnectionIds = [];
    }

    const connectedObject = haveSharedLink && getObjectById(scene, commonConnectionId);
    const ConnectionDisplayComponent = connectedObject && getListComponent(connectedObject);

    const onMouseEnterConnection = () => {
        setSpotlight(haveSharedLink ? selectSingle(commonConnectionId) : selectNone());
    };
    const onMouseLeaveConnection = () => {
        setSpotlight(selectNone());
    };

    function onClickConnection(event: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (haveSharedLink) {
            // Don't trigger the selection if modifiers are held
            if (!event.ctrlKey && !event.shiftKey) {
                setSelection(selectSingle(commonConnectionId));
                // The element disappearing will not trigger an onMouseLeave
                setSpotlight(selectNone());
            }
            return;
        } else {
            // For both "no current connections" and "multiple connections"
            if (allowedConnectionIds.length == 0) {
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
                                ...omit(obj, 'positionParentId'),
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
                allowedConnectionIds.length == 0
                    ? 'No available object to attach to'
                    : 'Attach the selection to another object';
            currentLinkTooltip = 'If this object moves, so does the selection';
            break;
        case ConnectionType.ROTATION:
            newLinkText = 'Face object';
            newLinkTooltip =
                allowedConnectionIds.length == 0
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
                onClick: onClickConnection,
                onMouseEnter: onMouseEnterConnection,
                onMouseLeave: onMouseLeaveConnection,
                disabled: !haveAnyLink && allowedConnectionIds.length == 0,
                style: {
                    paddingLeft: tokens.spacingHorizontalXS,
                },
            }}
            menuButton={{ onClick: onClickUnlink, disabled: !haveAnyLink }}
        >
            {haveSharedLink && ConnectionDisplayComponent && (
                <Tooltip content={currentLinkTooltip} relationship="description">
                    {
                        // https://github.com/facebook/react/issues/34794
                        // eslint-disable-next-line react-hooks/static-components
                        <ConnectionDisplayComponent size="field" showControls={false} object={connectedObject} />
                    }
                </Tooltip>
            )}
            {haveSharedLink && !ConnectionDisplayComponent && 'Unknown object'}
            {!haveSharedLink && haveAnyLink && (
                <Tooltip
                    content={'The selection is connected to two or more different objects'}
                    relationship="description"
                >
                    <div>Multiple objects</div>
                </Tooltip>
            )}
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
