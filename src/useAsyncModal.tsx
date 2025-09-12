import { DialogProps } from '@fluentui/react-components';
import { ReactNode, useRef, useState } from 'react';

export type ModalProps = Omit<DialogProps, 'children'>;

export type ModalState<Args, Result> = [showDialog: (args: Args) => Promise<Result>, renderDialog: () => ReactNode];

export type ModalRenderFunc<Args, Result> = (
    resolve: (result: Result) => void,
    props: ModalProps,
    args: Args,
) => ReactNode;

interface PromiseRef<Args, Result> {
    resolve: (result: Result) => void;
    args: Args;
}

/**
 * Creates a modal dialog that can be triggered and awaited on for user input.
 *
 * @example
    ```
    const [showModal, renderModal] = useAsyncModal((resolve, props) => {
       const confirmId = useId();
       const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

        return (
            <Dialog {...props} onOpenChange={onOpenChange}>
                <DialogSurface>
                    <HotkeyBlockingDialogBody>
                        ...
                        <DialogActions>
                            <DialogTrigger>
                                <Button id={confirmId} appearance="primary">
                                    Open anyways
                                </Button>
                            </DialogTrigger>
                            <DialogTrigger>
                                <Button>Cancel</Button>
                            </DialogTrigger>
                        </DialogActions>
                    </HotkeyBlockingDialogBody>
                </DialogSurface>
            </Dialog>
        );
    });

    const onClick = async () => {
        const confirmed = await showModal();
        console.log(confirmed);
    };

    return (
        <>
            <Button onClick={onClick}>Show modal</Button>
            {renderModal()}
        </>
    );
    ```
 */
export function useAsyncModal<Args = void, Result = boolean>(
    render: ModalRenderFunc<Args, Result>,
): ModalState<Args, Result> {
    const [open, setOpen] = useState(false);

    const promiseRef = useRef<PromiseRef<Args, Result>>(null);

    const openModal = (args: Args) => {
        return new Promise<Result>((resolve) => {
            promiseRef.current = { resolve, args };
            setOpen(true);
        });
    };

    const renderModal = () => {
        if (promiseRef.current === null) {
            return null;
        }

        const resolve = (result: Result) => {
            promiseRef.current?.resolve(result);
            setOpen(false);
        };

        return render(resolve, { open }, promiseRef.current.args);
    };

    return [openModal, renderModal];
}

type OpenChangeCallback = Required<DialogProps>['onOpenChange'];

/**
 * Dialog onOpenChange callback to resolve a modal created with useAsyncModal().
 *
 * Resolves to true if the user closes the dialog by clicking an element with the given ID, else false.
 */
export function useAsyncModalResolveCallback(
    confirmId: string,
    resolve: (result: boolean) => void,
): OpenChangeCallback {
    return (ev, data) => {
        if (data.type === 'escapeKeyDown') {
            resolve(false);
        } else {
            const target = ev.target as HTMLElement;
            resolve(target.id === confirmId);
        }
    };
}
