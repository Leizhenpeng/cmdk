import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { useCommand } from './CommandContext';
import { GroupContext } from './GroupContext';
import { useValue, mergeRefs, useCmdk, SlottableWithNestedChildren } from './utils';

type GroupProps = {
    children?: React.ReactNode;
    heading?: React.ReactNode;
    forceMount?: boolean;
    value?: string;
} & Omit<React.ComponentPropsWithoutRef<typeof Primitive.div>, 'heading' | 'value'>;

const Group = React.forwardRef<HTMLDivElement, GroupProps>((props, forwardedRef) => {
    const { heading, children, forceMount, ...etc } = props;
    const id = React.useId();
    const ref = React.useRef<HTMLDivElement>(null);
    const headingRef = React.useRef<HTMLDivElement>(null);
    const headingId = React.useId();
    const context = useCommand();
    const render = useCmdk((state) =>
        forceMount ? true : context.filter() === false ? true : !state.search ? true : state.filtered.groups.has(id)
    );

    React.useLayoutEffect(() => {
        return context.group(id);
    }, []);

    useValue(id, ref, [props.value, props.heading, headingRef]);

    const contextValue = React.useMemo(() => ({ id, forceMount }), [forceMount]);

    return (
        <Primitive.div
            ref={mergeRefs([ref, forwardedRef])}
            {...etc}
            cmdk-group=""
            role="presentation"
            hidden={render ? undefined : true}
        >
            {heading && (
                <div ref={headingRef} cmdk-group-heading="" aria-hidden id={headingId}>
                    {heading}
                </div>
            )}
            {SlottableWithNestedChildren(props, (child) => (
                <div cmdk-group-items="" role="group" aria-labelledby={heading ? headingId : undefined}>
                    <GroupContext.Provider value={contextValue}>{child}</GroupContext.Provider>
                </div>
            ))}
        </Primitive.div>
    );
});

export { Group };
