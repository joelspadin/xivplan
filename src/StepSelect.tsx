import { Button, makeStyles, SelectTabData, SelectTabEvent, Tab, TabList, tokens } from '@fluentui/react-components';
import { AddFilled, bundleIcon, DeleteFilled, DeleteRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useScene } from './SceneProvider';

function getStepText(index: number) {
    return (index + 1).toString();
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'row',
        columnGap: '8px',
        padding: '4px',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    tab: {
        minWidth: '16px',
    },
});

interface StepButtonProps {
    index: number;
}

const StepButton: React.FC<StepButtonProps> = ({ index }) => {
    const classes = useStyles();
    const stepText = getStepText(index);

    return (
        <Tab value={index} title={`Step ${stepText}`}>
            <div className={classes.tab}>{stepText}</div>
        </Tab>
    );
};

const AddStepButton: React.FC = () => {
    const { dispatch } = useScene();

    return (
        <Button
            icon={<AddFilled />}
            appearance="subtle"
            title="Add new step"
            onClick={() => dispatch({ type: 'addStep' })}
        />
    );
};

const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

const RemoveStepButton: React.FC = () => {
    const { scene, stepIndex, dispatch } = useScene();
    const stepText = getStepText(stepIndex);

    return (
        <Button
            icon={<DeleteIcon />}
            appearance="subtle"
            title={`Delete step ${stepText}`}
            disabled={scene.steps.length < 2}
            onClick={() => dispatch({ type: 'removeStep', index: stepIndex })}
        />
    );
};

export const StepSelect: React.FC = () => {
    const classes = useStyles();
    const { scene, stepIndex, dispatch } = useScene();
    const steps = useMemo(() => scene.steps.map((_, i) => i), [scene.steps]);

    const handleTabSelect = useCallback(
        (event: SelectTabEvent, data: SelectTabData) => {
            const index = data.value as number;
            dispatch({ type: 'setStep', index });
        },
        [dispatch],
    );

    return (
        <div className={classes.root}>
            <TabList size="small" selectedValue={stepIndex} appearance="subtle" onTabSelect={handleTabSelect}>
                {steps.map((i) => (
                    <StepButton key={i} index={i} />
                ))}
            </TabList>
            <AddStepButton />
            <RemoveStepButton />
        </div>
    );
};
