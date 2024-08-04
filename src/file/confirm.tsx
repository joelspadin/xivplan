import { useAsyncModal } from '../useAsyncModal';
import { DeleteFilePrompt, OverwriteFilePrompt } from './FilePrompts';
import { UnsavedChangesPrompt } from './UnsavedChangesPrompt';

export function useConfirmUnsavedChanges() {
    return useAsyncModal((resolve, props) => {
        return <UnsavedChangesPrompt resolve={resolve} {...props} />;
    });
}

export function useConfirmOverwriteFile() {
    return useAsyncModal<string>((resolve, props, filename) => {
        return <OverwriteFilePrompt resolve={resolve} filename={filename} {...props} />;
    });
}

export function useConfirmDeleteFile() {
    return useAsyncModal<string>((resolve, props, filename) => {
        return <DeleteFilePrompt resolve={resolve} filename={filename} {...props} />;
    });
}
