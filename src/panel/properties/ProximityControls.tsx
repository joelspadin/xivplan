import { Field, mergeClasses, ToggleButton, Tooltip } from '@fluentui/react-components';
import { CircleHighlightRegular, CircleRegular, PersonRegular, TargetRegular } from '@fluentui/react-icons';
import { ProximityStyle, type ProximityZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SliderField, type SliderFieldOnChangeData } from '../../SliderField';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ProximityTypeControl: React.FC<PropertiesControlProps<ProximityZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const proximityStyle = commonValue(objects, (obj) => obj.proximityStyle ?? ProximityStyle.Player);
    const hideGradient = commonValue(objects, (obj) => obj.hideGradient ?? false);

    const onTypeChanged = (newStyle: ProximityStyle) =>
        newStyle == ProximityStyle.Player
            ? update({ omit: ['proximityStyle'] })
            : update({ props: { proximityStyle: newStyle } });
    const onHideGradientChanged = () =>
        hideGradient ? update({ omit: ['hideGradient'] }) : update({ props: { hideGradient: true } });

    return (
        <Field label="Proximity Type" className={classes.cell}>
            <div className={classes.row}>
                <SegmentedGroup
                    name="proximity-type"
                    value={proximityStyle}
                    onChange={(ev, data) => onTypeChanged(data.value as ProximityStyle)}
                >
                    <Segment value={ProximityStyle.Player} icon={<PersonRegular />} title="Player-targeted" />
                    <Segment value={ProximityStyle.Ground} icon={<TargetRegular />} title="Ground-targeted" />
                </SegmentedGroup>
                <Tooltip content="Show or hide the gradient area" relationship="label" withArrow>
                    <ToggleButton
                        checked={!hideGradient}
                        onClick={onHideGradientChanged}
                        icon={hideGradient ? <CircleRegular /> : <CircleHighlightRegular />}
                    />
                </Tooltip>
            </div>
        </Field>
    );
};

// The max is set to 50 (in combination with the configured marker sizes) so that:
// - the floor and player target markers are visually approximately the same size when swapping between them
// - the proportion accurately represents the outer radius of the arcs of the floor marker vs the zone radius
// - at max size, the tips of the arrows of the player marker are on the zone edge
//
// We still want the slider to go to 100% in 5% steps though, so the value we display is double the
// actual value, and the step is half as large so that it has the correct size when doubled.

const VALUE_MIN = 5;
const VALUE_MAX = 50;

const DISPLAY_MAX = 100;
const DISPLAY_STEP = 5;

const DISPLAY_MULT = DISPLAY_MAX / VALUE_MAX;
const VALUE_STEP = DISPLAY_STEP / DISPLAY_MULT;

function getValueText(value: number | undefined) {
    return value === undefined ? '' : `${value * DISPLAY_MULT}%`;
}

export const ProximityScaleControl: React.FC<PropertiesControlProps<ProximityZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);
    const { dispatch } = useScene();

    const proportion = commonValue(objects, (obj) => obj.iconProportion);

    const onScaleChanged = (data: SliderFieldOnChangeData) =>
        update({ props: { iconProportion: data.value }, transient: data.transient });

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <SliderField
                className={classes.grow}
                label="Proximity Icon Proportion"
                min={VALUE_MIN}
                max={VALUE_MAX}
                step={VALUE_STEP}
                value={proportion}
                showValue={getValueText}
                onChange={(ev, data) => onScaleChanged(data)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </div>
    );
};
