import { IChoiceGroupOption } from '@fluentui/react';
import { Field, SpinButton } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { useScene } from '../../SceneProvider';
import { getTetherIcon, getTetherName } from '../../prefabs/TetherConfig';
import { MIN_TETHER_WIDTH } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { Tether, TetherType } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const tetherOptions: IChoiceGroupOption[] = [
    TetherType.Line,
    TetherType.Close,
    TetherType.Far,
    TetherType.MinusMinus,
    TetherType.PlusMinus,
    TetherType.PlusPlus,
].map((tether) => {
    const icon = getTetherIcon(tether);
    return {
        key: tether,
        text: getTetherName(tether),
        imageSrc: icon,
        selectedImageSrc: icon,
    };
});

export const TetherTypeControl: React.FC<PropertiesControlProps<Tether>> = ({ objects }) => {
    const { dispatch } = useScene();

    const tether = useMemo(() => commonValue(objects, (obj) => obj.tether), [objects]);

    const onTetherChanged = useCallback(
        (tether: TetherType) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, tether })) }),
        [dispatch, objects],
    );
    return (
        <CompactChoiceGroup
            label="Tether type"
            padding={4}
            options={tetherOptions}
            selectedKey={tether}
            onChange={(e, option) => onTetherChanged(option?.key as TetherType)}
        />
    );
};

export const TetherWidthControl: React.FC<PropertiesControlProps<Tether>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );

    return (
        <div className={classes.row}>
            <Field label="Width">
                <SpinButton
                    value={width ?? 0}
                    displayValue={width?.toString() ?? ''}
                    onChange={onWidthChanged}
                    min={MIN_TETHER_WIDTH}
                    step={2}
                />
            </Field>
        </div>
    );
};
