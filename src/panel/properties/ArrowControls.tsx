import { Button, Field, makeStyles } from '@fluentui/react-components';
import { ArrowLeftRegular, ArrowRightRegular, SubtractRegular } from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { ArrowObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ArrowPointersControl: React.FC<PropertiesControlProps<ArrowObject>> = ({ objects }) => {
    const classes = useStyles();
    const { dispatch } = useScene();

    const arrowBegin = commonValue(objects, (obj) => !!obj.arrowBegin);
    const arrowEnd = commonValue(objects, (obj) => !!obj.arrowEnd);

    const onToggleArrowBegin = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'arrowBegin', !arrowBegin)) });

    const onToggleArrowEnd = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'arrowEnd', !arrowEnd)) });

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
