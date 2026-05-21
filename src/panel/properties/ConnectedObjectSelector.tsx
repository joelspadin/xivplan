import { Button, SplitButton, tokens, Tooltip } from '@fluentui/react-components';
import { bundleIcon, DismissFilled, DismissRegular, LinkRegular, TabDesktopLinkRegular } from '@fluentui/react-icons';
import React from 'react';
import { getConnectionIdFuncs, unlinkAction } from '../../connections';
import { EditMode } from '../../editMode';
import { ConnectionType } from '../../EditModeContext';
import { getStepDisplayString, type SceneObject } from '../../scene';
import { getObjectById, getStepIndexForId, useScene } from '../../SceneProvider';
import { selectNone, selectSingle, useSelection, useSpotlight } from '../../selection';
import { useConnectionSelection } from '../../useConnectionSelection';
import { CONTROLS_ICON_COLUMN_WIDTH } from '../../useControlStyles';
import { useEditMode } from '../../useEditMode';
import { useObjectIds } from '../../useObjectIds';
import { commonValue } from '../../util';
import { getListComponent } from '../ListComponentRegistry';

export interface ConnectedObjectSelectorProps {
    readonly connectionType: ConnectionType;
    readonly objects: readonly SceneObject[];
}

export const ConnectedObjectSelector: React.FC<ConnectedObjectSelectorProps> = ({ connectionType, objects }) => {
    const { scene, stepIndex, dispatch } = useScene();
    const [, setSpotlight] = useSpotlight();
    const [, setEditMode] = useEditMode();
    const [, setConnectionSelection] = useConnectionSelection();
    const [, setSelection] = useSelection();
    const objectIds = useObjectIds(objects);

    const [getConnectionId, getAllowedConnectionIds] = getConnectionIdFuncs(connectionType);
    const commonConnectionId = commonValue(objects, getConnectionId);
    const commonConnectionStepIndex = commonValue(objects, (obj) => getStepIndexForId(scene, getConnectionId(obj)));
    const haveSharedLink = commonConnectionId !== undefined;
    const haveAnyLink = objects.find((obj) => getConnectionId(obj) !== undefined) !== undefined;
    const allowedConnectionIds = getAllowedConnectionIds(scene, objects);

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
            objectIdsToConnect: new Set(objectIds),
            connectionType,
        });
        // The list component disappears, so there's no onMouseLeave to clear the spotlight.
        setSpotlight(selectNone());
    }
    function onClickUnlink(): void {
        if (haveAnyLink) {
            dispatch(unlinkAction(connectionType, objectIds));
        }
    }
    function onClickConnectionStep(): void {
        if (commonConnectionStepIndex !== undefined) {
            dispatch({ type: 'setStep', index: commonConnectionStepIndex });
            if (haveSharedLink) {
                setSelection(selectSingle(commonConnectionId));
            }
        }
    }

    const linkTexts = getLinkTexts({
        connectionType,
        haveAnyLink,
        haveSharedLink,
        hasAllowedConnections: allowedConnectionIds.size > 0,
        commonConnectionStepIndex,
    });

    return (
        <>
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
                        fontWeight: 'normal',
                        fontSize: tokens.fontSizeBase200,
                        justifyContent: 'left',
                    },
                }}
                menuButton={{ onClick: onClickUnlink, disabled: !haveAnyLink }}
                // Leave room for the cross-step button
                style={{ maxWidth: `calc(100% - ${CONTROLS_ICON_COLUMN_WIDTH}px)` }}
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
                        withArrow
                    >
                        <div>Multiple objects</div>
                    </Tooltip>
                )}
                {!haveSharedLink && !haveAnyLink && (
                    <Tooltip content={linkTexts.tooltip} relationship="description" withArrow>
                        <div>{linkTexts.newLink}</div>
                    </Tooltip>
                )}
            </SplitButton>
            {/* Only show the cross-step button if the connection is actually cross-step */}
            {commonConnectionStepIndex !== undefined && commonConnectionStepIndex != stepIndex && (
                <Tooltip content={linkTexts.stepTooltip} relationship="description" withArrow>
                    <Button
                        onClick={onClickConnectionStep}
                        style={{
                            minWidth: 0,
                            paddingLeft: tokens.spacingHorizontalXS,
                            paddingRight: tokens.spacingHorizontalXS,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 'normal',
                                fontSize: tokens.fontSizeBase400,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <TabDesktopLinkRegular />
                            {getStepDisplayString(commonConnectionStepIndex)}
                        </span>
                    </Button>
                </Tooltip>
            )}
        </>
    );
};

interface LinkTexts {
    newLink: string;
    tooltip: string;
    stepTooltip: string;
}

interface GetLinkTextsArgs {
    connectionType: ConnectionType;
    haveAnyLink: boolean;
    haveSharedLink: boolean;
    hasAllowedConnections: boolean;
    commonConnectionStepIndex: number | undefined;
}

function getLinkTexts({
    connectionType,
    haveAnyLink,
    haveSharedLink,
    hasAllowedConnections,
    commonConnectionStepIndex,
}: GetLinkTextsArgs): LinkTexts {
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
    return {
        newLink: newLinkText,
        tooltip,
        stepTooltip: haveSharedLink
            ? `The connection is between objects on different steps. Click to select and view the connected object on step ${getStepDisplayString(commonConnectionStepIndex || 0)}.`
            : `The connection is between objects on different steps. Click to go to step ${getStepDisplayString(commonConnectionStepIndex || 0)} containing all connected objects.`,
    };
}

const UnlinkIcon = bundleIcon(DismissFilled, DismissRegular);

const UnlinkButton: React.FC = () => {
    return <UnlinkIcon />;
};
