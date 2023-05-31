import { IModalProps, IStyleFunctionOrObject, Theme } from '@fluentui/react';
import React from 'react';
import { BaseDialog, IBaseDialogStyles } from './BaseDialog';
import { ExternalLink } from './ExternalLink';

export const AboutDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="About" {...props} dialogStyles={dialogStyles}>
            <p>
                XIVPlan is a tool for quickly diagramming raid strategies for Final Fantasy XIV, inspired by{' '}
                <ExternalLink href="https://raidplan.io">RaidPlan.io</ExternalLink> and{' '}
                <ExternalLink href="https://ff14.toolboxgaming.space">FF14 Toolbox Gaming Space</ExternalLink>.
            </p>
            <h2>Giving Feedback</h2>
            <p>
                XIVPlan is open source on{' '}
                <ExternalLink href="https://github.com/joelspadin/xivplan">GitHub</ExternalLink>. If you find a bug or
                have other feedback, please use the &ldquo;issues&rdquo; tab on the GitHub page.
            </p>
            <h2>Credits</h2>
            <p>XIVPlan is © 2021 Joel Spadin.</p>
            <p>Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.</p>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        maxWidth: '70ch',
    },
};
