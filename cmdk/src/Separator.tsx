import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { useCmdk, mergeRefs } from './utils';

type SeparatorProps = {
    alwaysRender?: boolean;
} & React.ComponentPropsWithoutRef<typeof Primitive.div>;

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>((props, forwardedRef) => {
    const { alwaysRender, ...etc } = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const render = useCmdk((state) => !state.search);

    if (!alwaysRender && !render) return null;
    return <Primitive.div ref={mergeRefs([ref, forwardedRef])} {...etc} cmdk-separator="" role="separator" />;
});

export { Separator };
