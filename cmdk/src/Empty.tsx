import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { useCmdk, mergeRefs } from './utils';

type EmptyProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>((props, forwardedRef) => {
    const render = useCmdk((state) => state.filtered.count === 0);

    if (!render) return null;
    return <Primitive.div ref={mergeRefs([forwardedRef])} {...props} cmdk-empty="" role="presentation" />;
});

export { Empty };
