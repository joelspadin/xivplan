import { useToastController } from '@fluentui/react-components';
import React, { useEffect } from 'react';
import { useSceneLoadError } from './file/share';
import { MessageToast } from './MessageToast';

export const SceneLoadErrorNotifier: React.FC = () => {
    const sceneLoadError = useSceneLoadError();
    const { dispatchToast } = useToastController();

    useEffect(() => {
        if (sceneLoadError) {
            dispatchToast(<MessageToast title="Failed to load plan" message={sceneLoadError} />, {
                intent: 'error',
                timeout: -1,
            });
        }
    }, [sceneLoadError, dispatchToast]);

    return null;
};
