import { useToastController } from '@fluentui/react-components';
import React from 'react';
import { MessageToast } from './MessageToast';
import { useLoadScene } from './SceneProvider';
import { openFile } from './file';
import { getBlobSource } from './file/blob';
import { useConfirmUnsavedChanges } from './file/confirm';
import { getFileSource } from './file/filesystem';
import { useIsDirty } from './useIsDirty';

export function useFileLoader() {
    const loadScene = useLoadScene();

    return async (file: File | FileSystemFileHandle) => {
        const source = file instanceof File ? getBlobSource(file) : getFileSource(file);

        const scene = await openFile(source);

        // TODO: add to recent files list

        loadScene(scene, source);
    };
}

export function useFileLoaderDropTarget() {
    const loadFile = useFileLoader();
    const isDirty = useIsDirty();
    const { dispatchToast } = useToastController();
    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();

    const onDragOver: React.DragEventHandler = (ev) => {
        ev.preventDefault();
    };

    const onDrop: React.DragEventHandler = async (ev) => {
        const file = ev.dataTransfer.items[0]?.getAsFile();
        if (!file) {
            return;
        }

        if (file.name.endsWith('.xivplan')) {
            if (isDirty && !(await confirmUnsavedChanges())) {
                return;
            }

            try {
                await loadFile(file);
            } catch (ex: unknown) {
                dispatchToast(<MessageToast title="Error" message={ex} />, { intent: 'error' });
            }
        } else {
            dispatchToast(<MessageToast title="Unsupported file" message={`Cannot open file "${file.name}"`} />, {
                intent: 'info',
            });
        }
    };

    return { onDragOver, onDrop, renderModal };
}
