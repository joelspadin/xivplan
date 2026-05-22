import { Button, Field, makeStyles } from '@fluentui/react-components';
import { ArrowLeftRegular, ArrowRightRegular, SubtractRegular } from '@fluentui/react-icons';
import React from 'react';
import type { ArrowObject } from '../../scene';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ArrowPointersControl: React.FC<PropertiesControlProps<ArrowObject>> = ({ objects }) => {
    const classes = useStyles();
    const update = useObjectUpdater(objects);

    const arrowBegin = commonValue(objects, (obj) => !!obj.arrowBegin);
    const arrowEnd = commonValue(objects, (obj) => !!obj.arrowEnd);

    const onToggleArrowBegin = () => update(setOrOmitAction<ArrowObject>('arrowBegin', !arrowBegin));
    const onToggleArrowEnd = () => update(setOrOmitAction<ArrowObject>('arrowEnd', !arrowEnd));

    const arrowBeginIcon = arrowBegin ? <ArrowLeftRegular /> : <SubtractRegular />;
    const arrowEndIcon = arrowEnd ? <ArrowRightRegular /> : <SubtractRegular />;

    return (
        <Field label="Pointers">
            <div className={classes.wrapper}>
                <Button appearance="subtle" icon={arrowBeginIcon} onClick={onToggleArrowBegin} />
                <Button appearance="subtle" icon={arrowEndIcon} onClick={onToggleArrowEnd} />
            </div>
        </Field>
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexFlow: 'row',
    },
});
