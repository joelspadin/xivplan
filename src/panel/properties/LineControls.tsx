import { Field, mergeClasses } from '@fluentui/react-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { LineZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const LineSizeControl: React.FC<PropertiesControlProps<LineZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);
    const length = useMemo(() => commonValue(objects, (obj) => obj.length), [objects]);

    const onWidthChanged = useSpinChanged((width: number) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) });
    });
    const onLengthChanged = useSpinChanged((length: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, length })) }),
    );
    const { t } = useTranslation();

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label={t('LineControls.Width')}>
                <SpinButton value={width} onChange={onWidthChanged} min={MIN_LINE_WIDTH} step={5} />
            </Field>
            <Field label={t('LineControls.Length')}>
                <SpinButton value={length} onChange={onLengthChanged} min={MIN_LINE_LENGTH} step={5} />
            </Field>
        </div>
    );
};
