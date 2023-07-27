import { IStackTokens, IStyle, Stack, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useCurrentStep } from '../SceneProvider';
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
    isImageObject,
    isInnerRadiusObject,
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
    isTowerZone,
    isTransparent,
    supportsHollow,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { PANEL_PADDING } from './PanelStyles';
import { PropertiesControlProps } from './PropertiesControl';
import { ArrowPointersControl } from './properties/ArrowControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ColorControl, ColorSwatchControl } from './properties/ColorControl';
import { ConeAngleControl } from './properties/ConeControls';
import { EnemyRingControl } from './properties/EnemyControls';
import { ExaflareLengthControl } from './properties/ExaflareControls';
import { HollowControl } from './properties/HollowControl';
import { ImageControl } from './properties/ImageControl';
import { MarkerShapeControl } from './properties/MarkerControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { SizeControl } from './properties/SizeControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextStyleControl, TextValueControl } from './properties/TextControls';
import { TowerCountControl } from './properties/TowerControls';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
    } as IStyle,
});

export const PropertiesPanel: React.FC = () => {
    return (
        <div className={classNames.root}>
            <Controls />
        </div>
    );
};

interface ControlConditionProps {
    objects: readonly SceneObject[];
    test: (object: UnknownObject) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: React.FC<PropertiesControlProps<any>>;
}

const ControlCondition: React.FC<ControlConditionProps> = ({ objects, test, control }) => {
    const isValid = useMemo(() => objects.every(test), [objects, test]);
    const Control = control;

    return isValid ? <Control objects={objects} /> : null;
};

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const Controls: React.FC = () => {
    const [selection] = useSelection();
    const step = useCurrentStep();

    if (selection.size === 0) {
        return <p>No objects selected.</p>;
    }

    const objects = getSelectedObjects(step, selection);

    return (
        <>
            <ControlCondition objects={objects} test={isNamed} control={NameControl} />

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item grow>
                    <ControlCondition objects={objects} test={isColored} control={ColorControl} />
                </Stack.Item>
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition objects={objects} test={supportsHollow} control={HollowControl} />
                <ControlCondition objects={objects} test={isMarker} control={MarkerShapeControl} />
            </Stack>
            <ControlCondition objects={objects} test={isColored} control={ColorSwatchControl} />
            <ControlCondition objects={objects} test={isTransparent} control={OpacityControl} />
            <ControlCondition objects={objects} test={isDrawObject} control={DrawObjectBrushControl} />
            <ControlCondition objects={objects} test={isText} control={TextStyleControl} />

            {/* Position/Size */}
            <ControlCondition objects={objects} test={isImageObject} control={ImageControl} />
            <ControlCondition objects={objects} test={isMoveable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />

            <Stack horizontal tokens={stackTokens}>
                <ControlCondition objects={objects} test={isRadiusObject} control={RadiusControl} />
                <ControlCondition objects={objects} test={isInnerRadiusObject} control={InnerRadiusControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareLengthControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeWidthControl} />
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <ControlCondition objects={objects} test={isEnemy} control={EnemyRingControl} />
                <ControlCondition objects={objects} test={isRotateable} control={RotationControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeCountControl} />
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonSidesControl} />
                <ControlCondition
                    objects={objects}
                    test={(x) => isArcZone(x) || isConeZone(x)}
                    control={ConeAngleControl}
                />
            </Stack>

            {/* Special options */}
            <ControlCondition objects={objects} test={isParty} control={PartyIconControl} />
            <ControlCondition objects={objects} test={isTether} control={TetherWidthControl} />
            <ControlCondition objects={objects} test={isTowerZone} control={TowerCountControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
        </>
    );
};
