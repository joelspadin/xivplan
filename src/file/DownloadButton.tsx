import { Button, ButtonProps } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../SceneProvider';
import { downloadScene } from './blob';

export const DownloadButton: React.FC<ButtonProps> = ({ ...props }) => {
    const { scene, source } = useScene();

    return (
        <Button icon={<ArrowDownloadRegular />} onClick={() => downloadScene(scene, source?.name)} {...props}>
            Download
        </Button>
    );
};
