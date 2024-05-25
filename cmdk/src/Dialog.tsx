import * as RadixDialog from '@radix-ui/react-dialog';
import * as React from 'react';
import { Command } from './Command';

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    overlayClassName?: string;
    contentClassName?: string;
    container?: HTMLElement;
    label?: string;
} & React.ComponentPropsWithoutRef<typeof Command>;

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>((props, forwardedRef) => {
    const { open, onOpenChange, overlayClassName, contentClassName, container, ...etc } = props;
    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
            <RadixDialog.Portal container={container}>
                <RadixDialog.Overlay cmdk-overlay="" className={overlayClassName} />
                <RadixDialog.Content aria-label={props.label} cmdk-dialog="" className={contentClassName}>
                    <Command ref={forwardedRef} {...etc} />
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
});

export { Dialog };
