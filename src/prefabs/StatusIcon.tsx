import { Image, ImageFit, IStyle, mergeStyleSets, Stack } from '@fluentui/react';
import React from 'react';
import { PANEL_PADDING } from '../panel/PanelStyles';
import { ActorStatus } from '../scene';

const classNames = mergeStyleSets({
    row: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'grab',
    } as IStyle,
    icon: {
        width: 32,
        height: 32,
        marginRight: PANEL_PADDING,
    } as IStyle,
});

export const StatusIcon: React.FunctionComponent<ActorStatus> = ({ name, icon }) => {
    return (
        <Stack draggable horizontal verticalAlign="center" data-is-focusable={true} className={classNames.row}>
            <Image
                src={icon}
                title={name}
                draggable="false"
                imageFit={ImageFit.centerContain}
                className={classNames.icon}
            />
            <span>{name}</span>
        </Stack>
    );
};
