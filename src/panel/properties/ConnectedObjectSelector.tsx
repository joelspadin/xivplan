import { SplitButton, tokens, Tooltip } from '@fluentui/react-components';
import { bundleIcon, DismissFilled, DismissRegular, LinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { getConnectionIdFuncs } from '../../connections';
import { getAbsolutePosition, getAbsoluteRotation } from '../../coord';
import { EditMode } from '../../editMode';
import { ConnectionType } from '../../EditModeContext';
import { isMoveable, isRotateable, Scene, SceneObject } from '../../scene';
import { getObjectById, SceneAction, useScene } from '../../SceneProvider';
import { selectNone, selectSingle, useSpotlight } from '../../selection';
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
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();

    const [getConnectionId, getAllowedConnectionIds] = getConnectionIdFuncs(connectionType);
    const commonConnectionId = commonValue(objects, getConnectionId);
    const haveSharedLink = commonConnectionId !== undefined;
    const haveAnyLink = objects.find((obj) => getConnectionId(obj) !== undefined) !== undefined;
    const allowedConnectionIds = getAllowedConnectionIds(step, objects);

    const connectedObject = haveSharedLink && getObjectById(scene, commonConnectionId);
    const ConnectionDisplayComponent = connectedObject && getListComponent(connectedObject);

    const onMouseEnterConnection = () => {
        setSpotlight(haveSharedLink ? selectSingle(commonConnectionId) : selectNone());
    };
    const onMouseLeaveConnection = () => {
        setSpotlight(selectNone());
    };

    function onClickConnection(): void {
        // The button should be disabled if there are no available connections.
        if (allowedConnectionIds.size == 0) {
            return;
        }
        setEditMode(EditMode.SelectConnection);
        setConnectionSelection({
            objectIdsToConnect: new Set(objects.map((obj) => obj.id)),
            connectionType,
        });
        // The list component disappears, so there's no onMouseLeave to clear the spotlight.
        setSpotlight(selectNone());
    }
    function onClickUnlink(): void {
        if (haveAnyLink) {
            dispatch(unlinkAction(connectionType, objects, scene));
        }
    }

    const linkTexts = getLinkTexts({
        connectionType,
        haveAnyLink,
        hasAllowedConnections: allowedConnectionIds.size > 0,
    });

    return (
        <SplitButton
            icon={
                <Tooltip content={linkTexts.tooltip} relationship="description">
                    <LinkRegular />
                </Tooltip>
            }
            menuIcon={<UnlinkButton />}
            appearance="subtle"
            primaryActionButton={{
                onClick: onClickConnection,
                onMouseEnter: onMouseEnterConnection,
                onMouseLeave: onMouseLeaveConnection,
                disabled: !haveAnyLink && allowedConnectionIds.size == 0,
                style: {
                    paddingLeft: tokens.spacingHorizontalXS,
                },
            }}
            menuButton={{ onClick: onClickUnlink, disabled: !haveAnyLink }}
        >
            {haveSharedLink && ConnectionDisplayComponent && (
                // https://github.com/facebook/react/issues/34794
                // eslint-disable-next-line react-hooks/static-components
                <ConnectionDisplayComponent size="field" showControls={false} object={connectedObject} />
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
            {!haveSharedLink && !haveAnyLink && (
                <Tooltip content={linkTexts.tooltip} relationship="description">
                    <div>{linkTexts.newLink}</div>
                </Tooltip>
            )}
        </SplitButton>
    );
};

interface LinkTexts {
    newLink: string;
    tooltip: string;
}

interface GetLinkTextsArgs {
    connectionType: ConnectionType;
    haveAnyLink: boolean;
    hasAllowedConnections: boolean;
}

function getLinkTexts({ connectionType, haveAnyLink, hasAllowedConnections }: GetLinkTextsArgs): LinkTexts {
    let newLinkText = '';
    let tooltip = '';
    switch (connectionType) {
        case ConnectionType.POSITION:
            newLinkText = 'Link position';
            if (haveAnyLink) {
                tooltip = 'If this object moves, so does the selection';
            } else if (hasAllowedConnections) {
                tooltip = 'Attach the selection to another object';
            } else {
                tooltip = 'No available object to attach to';
            }
            break;
        case ConnectionType.ROTATION:
            newLinkText = 'Face object';
            if (haveAnyLink) {
                tooltip = 'If this object moves, the selection will rotate to face it (plus the Rotation value)';
            } else if (hasAllowedConnections) {
                tooltip = 'Automatically rotate towards another object';
            } else {
                tooltip = 'No available object to face';
            }
            break;
    }
    return { newLink: newLinkText, tooltip };
}

const UnlinkIcon = bundleIcon(DismissFilled, DismissRegular);

const UnlinkButton: React.FC = () => {
    return <UnlinkIcon />;
};

function unlinkAction(connectionType: ConnectionType, objects: readonly SceneObject[], scene: Scene): SceneAction {
    switch (connectionType) {
        case ConnectionType.POSITION:
            return {
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
            };
        case ConnectionType.ROTATION:
            return {
                type: 'update',
                value: objects.filter(isRotateable).map((obj) => {
                    return {
                        ...omit(obj, 'facingId'),
                        rotation: isMoveable(obj) ? getAbsoluteRotation(scene, obj) : 0,
                    };
                }),
            };
    }
}
