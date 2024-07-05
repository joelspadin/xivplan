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
    StatusGreenCircleTarget,
    StatusGreenTarget,
    StatusIgnore1,
    StatusIgnore2,
    StatusRedTarget,
    StatusSquare,
    StatusTriangle,
    StatusUltimateCircle,
    StatusUltimateCross,
    StatusUltimateSquare,
    StatusUltimateTriangle,
} from '../prefabs/Status';
import { useControlStyles } from '../useControlStyles';
import { ObjectGroup, Section } from './Section';

export const StatusMarkers: React.FC = () => {
    const classes = useControlStyles();

    return (
        <div className={classes.panel}>
            <Section title="General">
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
            <Section title="Counters">
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
            <Section title="Target indicators">
                <ObjectGroup>
                    <StatusBlueCircleTarget />
                    <StatusGreenCircleTarget />
                    <StatusCrosshairs />
                    <StatusRedTarget />
                    <StatusGreenTarget />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusUltimateTriangle />
                    <StatusUltimateCircle />
                    <StatusUltimateCross />
                    <StatusUltimateSquare />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusEdenYellow />
                    <StatusEdenOrange />
                    <StatusEdenBlue />
                </ObjectGroup>
            </Section>
            <Section title="Status effects">
                <ObjectGroup>
                    <StatusDice1 />
                    <StatusDice2 />
                    <StatusDice3 />
                </ObjectGroup>
            </Section>
        </div>
    );
};
