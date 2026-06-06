import { useArrowNavigationGroup } from '@fluentui/react-components';
import React from 'react';
import {
    StatusAttack1,
    StatusAttack2,
    StatusAttack3,
    StatusAttack4,
    StatusAttack5,
    StatusAttack6,
    StatusAttack7,
    StatusAttack8,
    StatusBind1,
    StatusBind2,
    StatusBind3,
    StatusBlueCircleTarget,
    StatusBlueCircleTargetOld,
    StatusCircle,
    StatusCounter1,
    StatusCounter2,
    StatusCounter3,
    StatusCounter4,
    StatusCounter5,
    StatusCounter6,
    StatusCounter7,
    StatusCounter8,
    StatusCross,
    StatusCrosshairs,
    StatusDice1,
    StatusDice2,
    StatusDice3,
    StatusEdenBlue,
    StatusEdenOrange,
    StatusEdenYellow,
    StatusGreenCircleTargetOld,
    StatusGreenTarget,
    StatusGreenTargetOld,
    StatusIgnore1,
    StatusIgnore2,
    StatusPurpleTarget,
    StatusRedTarget,
    StatusRedTargetOld,
    StatusSquare,
    StatusTankbuster,
    StatusTriangle,
    StatusUltimateCircle,
    StatusUltimateCross,
    StatusUltimateSquare,
    StatusUltimateTriangle,
} from '../prefabs/Status';
import { useControlStyles } from '../useControlStyles';
import { ObjectGroup, ObjectGroupGrid, Section } from './Section';

export const StatusMarkers: React.FC = () => {
    const classes = useControlStyles();
    const attributes = useArrowNavigationGroup({ axis: 'grid-linear' });

    return (
        <div className={classes.panel} {...attributes}>
            <Section header="General">
                <ObjectGroup>
                    <StatusAttack1 />
                    <StatusAttack2 />
                    <StatusAttack3 />
                    <StatusAttack4 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusAttack5 />
                    <StatusAttack6 />
                    <StatusAttack7 />
                    <StatusAttack8 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusIgnore1 />
                    <StatusIgnore2 />
                    <StatusBind1 />
                    <StatusBind2 />
                    <StatusBind3 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusTriangle />
                    <StatusCircle />
                    <StatusCross />
                    <StatusSquare />
                </ObjectGroup>
            </Section>
            <Section header="Counters">
                <ObjectGroup>
                    <StatusCounter1 />
                    <StatusCounter2 />
                    <StatusCounter3 />
                    <StatusCounter4 />
                    <StatusCounter5 />
                    <StatusCounter6 />
                    <StatusCounter7 />
                    <StatusCounter8 />
                </ObjectGroup>
            </Section>
            <Section header="Target indicators">
                <ObjectGroupGrid size={48}>
                    <StatusBlueCircleTarget />
                    <StatusTankbuster />
                </ObjectGroupGrid>
                <ObjectGroupGrid size={40}>
                    <StatusCrosshairs />
                    <StatusGreenTarget />
                    <StatusPurpleTarget />
                    <StatusRedTarget />
                </ObjectGroupGrid>
                <ObjectGroupGrid size={40}>
                    <StatusBlueCircleTargetOld />
                    <StatusGreenCircleTargetOld />
                    <StatusGreenTargetOld />
                    <StatusRedTargetOld />
                </ObjectGroupGrid>
                <ObjectGroupGrid size={40}>
                    <StatusUltimateTriangle />
                    <StatusUltimateCircle />
                    <StatusUltimateCross />
                    <StatusUltimateSquare />
                </ObjectGroupGrid>
                <ObjectGroupGrid size={40}>
                    <StatusEdenYellow />
                    <StatusEdenOrange />
                    <StatusEdenBlue />
                </ObjectGroupGrid>
            </Section>
            <Section header="Status effects">
                <ObjectGroupGrid size={40}>
                    <StatusDice1 />
                    <StatusDice2 />
                    <StatusDice3 />
                </ObjectGroupGrid>
            </Section>
        </div>
    );
};
