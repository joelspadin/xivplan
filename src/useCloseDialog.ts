import { useCallback, useContext } from 'react';

import { Dispatch, SetStateAction, createContext } from 'react';

export type DialogOpenState = Dispatch<SetStateAction<boolean>>;

export const DialogOpenContext = createContext<DialogOpenState>(() => {});

/**
 * @returns A function to close a dialog.
 *
 * @example
 * ```
    const [open, setOpen] = useState(false);

    return (
        <DialogOpenContext.Provider value={setOpen}>
            <MyCustomDialog open={open} />
        </DialogOpenContext.Provider>
    );

    // MyCustomDialog
    const closeDialog = useCloseDialog();

    const handleEvent = () => {
        doSomething();
        closeDialog();
    };

    return <Dialog {...props}>...</Dialog>;
 * ```
 */
export function useCloseDialog() {
    const setOpen = useContext(DialogOpenContext);

    return useCallback(() => setOpen(false), [setOpen]);
}
