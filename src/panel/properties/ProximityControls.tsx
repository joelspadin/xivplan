import { Field } from '@fluentui/react-components';
import { PersonRegular, TargetRegular } from '@fluentui/react-icons';
import { ProximityStyle, type ProximityZone } from '../../scene';
import { Segment, SegmentedGroup } from '../../Segmented';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ProximityTypeControl: React.FC<PropertiesControlProps<ProximityZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const proximityStyle = commonValue(objects, (obj) => obj.proximityStyle ?? ProximityStyle.Player);

    const onTypeChanged = (newStyle: ProximityStyle) =>
        newStyle == ProximityStyle.Player
            ? update({ omit: ['proximityStyle'] })
            : update({ props: { proximityStyle: newStyle } });

    return (
        <Field label="Proximity Type" className={classes.cell}>
            <SegmentedGroup
                name="proximity-type"
                value={proximityStyle}
                onChange={(ev, data) => onTypeChanged(data.value as ProximityStyle)}
            >
                <Segment value={ProximityStyle.Player} icon={<PersonRegular />} title="Player-targeted" />
                <Segment value={ProximityStyle.Ground} icon={<TargetRegular />} title="Ground-targeted" />
            </SegmentedGroup>
        </Field>
    );
};
