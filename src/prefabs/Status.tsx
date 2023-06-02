import * as React from 'react';
import { StatusIcon } from './StatusIcon';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => <StatusIcon name={name} icon={`/status/${icon}`} />;
}

export const StatusEdenYellow = makeIcon('Yellow marker', 'eden/yellow.png');
export const StatusEdenOrange = makeIcon('Orange marker', 'eden/orange.png');
export const StatusEdenBlue = makeIcon('Blue marker', 'eden/blue.png');
