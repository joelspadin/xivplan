import { IModalProps, IStyle, IStyleFunctionOrObject, mergeStyleSets, Theme } from '@fluentui/react';
import React from 'react';
import { Alert } from './Alert';
import { BaseDialog, IBaseDialogStyles } from './BaseDialog';
import { ExternalLink } from './ExternalLink';

const classNames = mergeStyleSets({
    allowList: {
        listStyleType: '"✅ "',
    } as IStyle,
    denyList: {
        listStyleType: '"❌ "',
    } as IStyle,
});

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
            <Alert title="Please read this before asking for new features">
                <p>
                    I do nearly all content in this game without guides. You will probably see new raid bosses and
                    mechanics before me, but{' '}
                    <em>I don&apos;t want to know anything about any content I have not already cleared</em>.
                </p>
                <h3>You may ask about the following content</h3>
                <ul className={classNames.allowList}>
                    <li>All content from Shadowbringers and earlier</li>
                </ul>
                <h3> Please do not discuss the following content</h3>
                <ul className={classNames.denyList}>
                    <li>All Endwalker content that is not listed above</li>
                </ul>
                <p>Thanks!</p>
            </Alert>
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
