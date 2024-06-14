import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Link,
} from '@fluentui/react-components';
import React from 'react';
import { ExternalLink } from './ExternalLink';

export interface AboutDialogProps {
    className?: string;
}

export const AboutDialog: React.FC<AboutDialogProps> = (props) => {
    return (
        <Dialog>
            <DialogTrigger>
                <Link {...props}>About</Link>
            </DialogTrigger>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>About</DialogTitle>
                    <DialogContent>
                        <p>
                            XIVPlan is a tool for quickly diagramming raid strategies for Final Fantasy XIV, inspired by{' '}
                            <ExternalLink href="https://raidplan.io">RaidPlan.io</ExternalLink> and{' '}
                            <ExternalLink href="https://ff14.toolboxgaming.space">
                                FF14 Toolbox Gaming Space
                            </ExternalLink>
                            .
                        </p>
                        <h2>Giving Feedback</h2>
                        <p>
                            XIVPlan is open source on{' '}
                            <ExternalLink href="https://github.com/joelspadin/xivplan">GitHub</ExternalLink>. If you
                            find a bug or have other feedback, please use the &ldquo;issues&rdquo; tab on the GitHub
                            page.
                        </p>
                        <h2>Credits</h2>
                        <p>XIVPlan is © 2021 Joel Spadin.</p>
                        <p>Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.</p>
                        <p>
                            <ExternalLink href="https://magentalava.gumroad.com/l/limitcuticons">
                                Limit cut counter icons
                            </ExternalLink>{' '}
                            by yullanellis.
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
