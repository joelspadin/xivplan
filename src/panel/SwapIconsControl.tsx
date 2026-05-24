import { Button, Image, makeStyles, Switch, tokens } from '@fluentui/react-components';
import React, { createContext, use, useState } from 'react';
import { getJob, getJobIconUrl, Job } from '../jobs';
import { isImageObject, type Scene, type SceneObject, type SceneStep } from '../scene';
import type { EditorState } from '../SceneProvider';
import { type SceneAction, useScene } from '../SceneProvider';
import type { UndoRedoAction } from '../undo/undoReducer';

type IconSwaps = Map<string, { name: string; image: string }>;

function makeIconSwaps(swaps: Partial<Record<Job, Job>>): IconSwaps {
    return new Map(
        (Object.entries(swaps) as [string, Job][]).map(([from, to]) => {
            const toProps = getJob(to);
            return [
                getJobIconUrl(getJob(Number(from) as Job).icon),
                { name: toProps.name, image: getJobIconUrl(toProps.icon) },
            ];
        }),
    );
}

const SWAP_DPS_1234_WITH_MR_12 = makeIconSwaps({
    [Job.RoleDps1]: Job.RoleMelee1,
    [Job.RoleDps2]: Job.RoleMelee2,
    [Job.RoleDps3]: Job.RoleRanged1,
    [Job.RoleDps4]: Job.RoleRanged2,
    [Job.RoleMelee1]: Job.RoleDps1,
    [Job.RoleMelee2]: Job.RoleDps2,
    [Job.RoleRanged1]: Job.RoleDps3,
    [Job.RoleRanged2]: Job.RoleDps4,
});

const SWAP_H12_WITH_PURE_BARRIER = makeIconSwaps({
    [Job.RoleHealer1]: Job.RolePureHealer,
    [Job.RoleHealer2]: Job.RoleBarrierHealer,
    [Job.RolePureHealer]: Job.RoleHealer1,
    [Job.RoleBarrierHealer]: Job.RoleHealer2,
});

const SWAP_R12_WITH_PHYSICAL_MAGIC = makeIconSwaps({
    [Job.RoleRanged1]: Job.RolePhysicalRanged,
    [Job.RoleRanged2]: Job.RoleMagicRanged,
    [Job.RolePhysicalRanged]: Job.RoleRanged1,
    [Job.RoleMagicRanged]: Job.RoleRanged2,
});

const SWAP_M12_WITH_R12 = makeIconSwaps({
    [Job.RoleRanged1]: Job.RoleMelee1,
    [Job.RoleRanged2]: Job.RoleMelee2,
    [Job.RoleMelee1]: Job.RoleRanged1,
    [Job.RoleMelee2]: Job.RoleRanged2,
});

const SWAP_TANKS = makeIconSwaps({
    [Job.RoleTank1]: Job.RoleTank2,
    [Job.RoleTank2]: Job.RoleTank1,
});

const SWAP_LIGHT_PARTIES = makeIconSwaps({
    [Job.RoleTank1]: Job.RoleTank2,
    [Job.RoleTank2]: Job.RoleTank1,
    [Job.RoleHealer1]: Job.RoleHealer2,
    [Job.RoleHealer2]: Job.RoleHealer1,
    [Job.RoleMelee1]: Job.RoleMelee2,
    [Job.RoleMelee2]: Job.RoleMelee1,
    [Job.RoleRanged1]: Job.RoleRanged2,
    [Job.RoleRanged2]: Job.RoleRanged1,
    [Job.RoleDps1]: Job.RoleDps2,
    [Job.RoleDps2]: Job.RoleDps1,
    [Job.RoleDps3]: Job.RoleDps4,
    [Job.RoleDps4]: Job.RoleDps3,
    [Job.RolePureHealer]: Job.RoleBarrierHealer,
    [Job.RoleBarrierHealer]: Job.RolePureHealer,
    [Job.RolePhysicalRanged]: Job.RoleMagicRanged,
    [Job.RoleMagicRanged]: Job.RolePhysicalRanged,
});

function jobIcon(job: Job) {
    const { icon, name } = getJob(job);
    return <Image key={job} src={getJobIconUrl(icon)} title={name} width={24} height={24} draggable={false} />;
}

function collectSwaps(step: SceneStep, swaps: IconSwaps): SceneObject[] {
    const updates: SceneObject[] = [];
    for (const object of step.objects) {
        if (isImageObject(object)) {
            const newProps = swaps.get(object.image);
            if (newProps !== undefined) {
                updates.push({ ...object, ...newProps } as SceneObject);
            }
        }
    }
    return updates;
}

function swapIcons(
    dispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>,
    scene: Scene,
    step: SceneStep,
    swaps: IconSwaps,
    allSteps: boolean,
) {
    const steps = allSteps ? scene.steps : [step];
    const updates = steps.flatMap((s) => collectSwaps(s, swaps));
    if (updates.length > 0) {
        dispatch({ type: allSteps ? 'updateAllSteps' : 'update', value: updates });
    }
}

const AllStepsToggleContext = createContext(false);

interface SwapButtonProps {
    swaps: IconSwaps;
    left: Job[];
    right: Job[];
}

const SwapButton: React.FC<SwapButtonProps> = ({ swaps, left, right }) => {
    const { dispatch, step, scene } = useScene();
    const allSteps = use(AllStepsToggleContext);
    const classes = useStyles();

    return (
        <Button className={classes.button} onClick={() => swapIcons(dispatch, scene, step, swaps, allSteps)}>
            <span className={classes.icons}>
                {left.map(jobIcon)}
                {'⇔'}
                {right.map(jobIcon)}
            </span>
        </Button>
    );
};

export const SwapIconsControl: React.FC = () => {
    const [allSteps, setAllSteps] = useState(false);
    const classes = useStyles();

    return (
        <AllStepsToggleContext value={allSteps}>
            <div className={classes.container}>
                <SwapButton
                    swaps={SWAP_DPS_1234_WITH_MR_12}
                    left={[Job.RoleMelee1, Job.RoleRanged1]}
                    right={[Job.RoleDps1, Job.RoleDps3]}
                />
                <SwapButton
                    swaps={SWAP_H12_WITH_PURE_BARRIER}
                    left={[Job.RoleHealer1, Job.RoleHealer2]}
                    right={[Job.RolePureHealer, Job.RoleBarrierHealer]}
                />
                <SwapButton
                    swaps={SWAP_R12_WITH_PHYSICAL_MAGIC}
                    left={[Job.RoleRanged1, Job.RoleRanged2]}
                    right={[Job.RolePhysicalRanged, Job.RoleMagicRanged]}
                />
                <SwapButton
                    swaps={SWAP_M12_WITH_R12}
                    left={[Job.RoleMelee1, Job.RoleMelee2]}
                    right={[Job.RoleRanged1, Job.RoleRanged2]}
                />
                <SwapButton swaps={SWAP_TANKS} left={[Job.RoleTank1]} right={[Job.RoleTank2]} />
                <SwapButton
                    swaps={SWAP_LIGHT_PARTIES}
                    left={[Job.RoleTank1, Job.RoleHealer1, Job.RoleDps1]}
                    right={[Job.RoleTank2, Job.RoleHealer2, Job.RoleDps2]}
                />
                <Switch
                    label="Apply to all steps"
                    checked={allSteps}
                    onChange={(_, data) => setAllSteps(data.checked)}
                />
            </div>
        </AllStepsToggleContext>
    );
};

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
        alignSelf: 'center',
        gap: tokens.spacingVerticalS,
    },
    button: {
        padding: '6px 8px 5px',
        minWidth: 0,
    },
    icons: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
});
