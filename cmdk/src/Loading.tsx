import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { mergeRefs, SlottableWithNestedChildren } from './utils';

type LoadingProps = {
    children?: React.ReactNode;
    progress?: number;
    label?: string;
} & React.ComponentPropsWithoutRef<typeof Primitive.div>;

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>((props, forwardedRef) => {
    const { progress, children, label = 'Loading...', ...etc } = props;

    return (
        <Primitive.div
            ref={mergeRefs([forwardedRef])}
            {...etc}
            cmdk-loading=""
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
        >
            {SlottableWithNestedChildren(props, (child) => (
                <div aria-hidden>{child}</div>
            ))}
        </Primitive.div>
    );
});

export { Loading };
