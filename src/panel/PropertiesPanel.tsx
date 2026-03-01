import { Button, mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { ConnectionType } from '../EditModeContext';
import { useCurrentStep } from '../SceneProvider';
import { EditMode } from '../editMode';
import {
    SceneObject,
    UnknownObject,
    isArcZone,
    isArrow,
    isColored,
    isConeZone,
    isDrawObject,
    isEnemy,
    isExaflareZone,
    isEye,
    isIcon,
    isImageObject,
    isInnerRadiusObject,
    isLineZone,
    isMarker,
    isMoveable,
    isNamed,
    isParty,
    isPolygonZone,
    isRadiusObject,
    isResizable,
    isRotateable,
    isStarburstZone,
    isTether,
    isText,
    supportsHollow,
    supportsStackCount,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useConnectionSelection } from '../useConnectionSelection';
import { useControlStyles } from '../useControlStyles';
import { useEditMode } from '../useEditMode';
import { PropertiesControlProps } from './PropertiesControl';
import { ArrowPointersControl } from './properties/ArrowControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ColorControl, ColorSwatchControl } from './properties/ColorControl';
import { ConeAngleControl } from './properties/ConeControls';
import { EnemyRingControl } from './properties/EnemyControls';
import { ExaflareLengthControl, ExaflareSpacingControl } from './properties/ExaflareControls';
import { EyeInvertControl } from './properties/EyeControls';
import { HideControl } from './properties/HideControl';
import { HollowControl } from './properties/HollowControl';
import { IconStacksControl, IconTimeControl } from './properties/IconControls';
import { ImageControl } from './properties/ImageControl';
import { LineSizeControl } from './properties/LineControls';
import { MarkerShapeControl } from './properties/MarkerControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonOrientationControl, PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { SizeControl } from './properties/SizeControl';
import { StackCountControl } from './properties/StackCountControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextLayoutControl, TextOutlineControl, TextValueControl } from './properties/TextControls';

export interface PropertiesPanelProps {
    className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.column, className)}>
            <Controls />
        </div>
    );
};

interface ControlConditionProps<T extends UnknownObject> {
    objects: readonly SceneObject[];
    test: (object: UnknownObject) => object is T;
    invert?: boolean;
    control: React.FC<PropertiesControlProps<T>>;
    className?: string;
}

function ControlCondition<T>({ objects, test, invert, control, className }: ControlConditionProps<T & UnknownObject>) {
    const result = objects.every(test);
    const isValid = invert ? !result : result;

    const Control = control;
    return isValid ? <Control objects={objects as (T & UnknownObject)[]} className={className} /> : null;
}

const NoObjectsMessage: React.FC = () => {
    return <p>No objects selected.</p>;
};

interface ConnectionSelectionMessageProps {
    type: ConnectionType;
}

const ConnectionSelectionMessage: React.FC<ConnectionSelectionMessageProps> = ({ type }) => {
    const [, setEditMode] = useEditMode();
    const message = getConnectionMessage(type);

    return (
        <>
            <p>{message}</p>
            <Button onClick={() => setEditMode(EditMode.Normal)}>Cancel</Button>
        </>
    );
};

function getConnectionMessage(type: ConnectionType) {
    switch (type) {
        case ConnectionType.POSITION:
            return 'Select an object to attach the selection to. The selection or their attachments are not eligible targets.';
        case ConnectionType.ROTATION:
            return 'Select an object to make the selection face towards. Objects in the selection are not eligible targets.';
    }
}

const Controls: React.FC = () => {
    const classes = useControlStyles();
    const [selection] = useSelection();
    const step = useCurrentStep();
    const [editMode] = useEditMode();
    const [{ connectionType }] = useConnectionSelection();

    if (editMode == EditMode.SelectConnection) {
        return <ConnectionSelectionMessage type={connectionType} />;
    }

    if (selection.size === 0) {
        return <NoObjectsMessage />;
    }

    const objects = getSelectedObjects(step, selection);

    if (objects.length === 0) {
        return <NoObjectsMessage />;
    }

    return (
        <>
            <ControlCondition objects={objects} test={isNamed} control={NameControl} />
            <ControlCondition objects={objects} test={isImageObject} control={ImageControl} />

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <div className={mergeClasses(classes.row, classes.alignTop)}>
                <ControlCondition objects={objects} test={isColored} control={ColorControl} className={classes.grow} />
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition objects={objects} test={supportsHollow} control={HollowControl} />
                <ControlCondition objects={objects} test={isMarker} control={MarkerShapeControl} />
            </div>
            <ControlCondition objects={objects} test={isColored} control={ColorSwatchControl} />
            <ControlCondition objects={objects} test={isText} control={TextOutlineControl} />
            <div className={mergeClasses(classes.row)}>
                <OpacityControl objects={objects} className={classes.grow} />
                <HideControl objects={objects} />
            </div>
            <ControlCondition objects={objects} test={isDrawObject} control={DrawObjectBrushControl} />
            <ControlCondition objects={objects} test={isText} control={TextLayoutControl} />

            {/* Position/Size */}
            <ControlCondition objects={objects} test={isMoveable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />
            <ControlCondition objects={objects} test={isLineZone} control={LineSizeControl} />

            {/* TODO: change this to a two-column grid? */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRadiusObject} control={RadiusControl} />
                <ControlCondition objects={objects} test={isInnerRadiusObject} control={InnerRadiusControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareLengthControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeWidthControl} />
            </div>

            <ControlCondition objects={objects} test={isRotateable} control={RotationControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isEnemy} control={EnemyRingControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareSpacingControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeCountControl} />

                <ControlCondition
                    objects={objects}
                    test={(x) => isArcZone(x) || isConeZone(x)}
                    control={ConeAngleControl}
                />
            </div>

            {/* Special options */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonSidesControl} />
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonOrientationControl} />
            </div>
            <ControlCondition objects={objects} test={isParty} control={PartyIconControl} />
            <ControlCondition objects={objects} test={isTether} control={TetherWidthControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={supportsStackCount} control={StackCountControl} />
            </div>
            <ControlCondition objects={objects} test={isEye} control={EyeInvertControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isIcon} control={IconStacksControl} />
                <ControlCondition objects={objects} test={isIcon} control={IconTimeControl} />
            </div>
        </>
    );
};
