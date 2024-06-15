import { IChoiceGroupOption } from '@fluentui/react';
import { Field } from '@fluentui/react-components';
import React from 'react';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { useScene } from '../SceneProvider';
import { SpinButton } from '../SpinButton';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { ArenaShape } from '../scene';
import { useControlStyles } from '../useControlStyles';

const arenaShapes: IChoiceGroupOption[] = [
    // TODO: use CircleShape and SquareShape whenever icon font gets fixed.
    { key: ArenaShape.Circle, text: 'Ellipse', iconProps: { iconName: 'CircleRing' } },
    { key: ArenaShape.Rectangle, text: 'Rectangle', iconProps: { iconName: 'Checkbox' } },
];

export const ArenaShapeEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const { shape, width, height, padding } = scene.arena;

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaHeight', value }));
    const onPaddingChanged = useSpinChanged((value) => dispatch({ type: 'arenaPadding', value }));

    return (
        <div className={classes.column}>
            <div className={classes.row}>
                <CompactChoiceGroup
                    className={classes.cell}
                    label="Arena shape"
                    options={arenaShapes}
                    selectedKey={shape}
                    onChange={(ev, option) => {
                        option && dispatch({ type: 'arenaShape', value: option.key as ArenaShape });
                    }}
                />
                <Field label="Padding" className={classes.cell}>
                    <SpinButton min={20} max={500} step={10} value={padding} onChange={onPaddingChanged} />
                </Field>
            </div>
            <div className={classes.row}>
                <Field label="Width">
                    <SpinButton min={50} max={2000} step={50} value={width} onChange={onWidthChanged} />
                </Field>
                <Field label="Height">
                    <SpinButton min={50} max={2000} step={50} value={height} onChange={onHeightChanged} />
                </Field>
            </div>
        </div>
    );
};
