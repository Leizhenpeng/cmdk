import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { useCommand } from './CommandContext';
import { useCmdk, mergeRefs, SlottableWithNestedChildren } from './utils';

type ListProps = {
    children?: React.ReactNode;
    label?: string;
} & React.ComponentPropsWithoutRef<typeof Primitive.div>;

const List = React.forwardRef<HTMLDivElement, ListProps>((props, forwardedRef) => {
    const { children, label = 'Suggestions', ...etc } = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const height = React.useRef<HTMLDivElement>(null);
    const context = useCommand();

    React.useEffect(() => {
        if (height.current && ref.current) {
            const el = height.current;
            const wrapper = ref.current;
            let animationFrame;
            const observer = new ResizeObserver(() => {
                animationFrame = requestAnimationFrame(() => {
                    const height = el.offsetHeight;
                    wrapper.style.setProperty('--cmdk-list-height', height.toFixed(1) + 'px');
                });
            });
            observer.observe(el);
            return () => {
                cancelAnimationFrame(animationFrame);
                observer.unobserve(el);
            };
        }
    }, []);

    return (
        <Primitive.div
            ref={mergeRefs([ref, forwardedRef])}
            {...etc}
            cmdk-list=""
            role="listbox"
            aria-label={label}
            id={context.listId}
        >
            {SlottableWithNestedChildren(props, (child) => (
                <div ref={mergeRefs([height, context.listInnerRef])} cmdk-list-sizer="">
                    {child}
                </div>
            ))}
        </Primitive.div>
    );
});

export { List };
