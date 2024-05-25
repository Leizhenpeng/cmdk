import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { useCommand } from './CommandContext';
import { useStore } from './StoreContext';
import { GroupContext } from './GroupContext';
import { useAsRef, useCmdk, useValue, mergeRefs } from './utils';

type ItemProps = {
    children?: React.ReactNode;
    disabled?: boolean;
    onSelect?: (value: string) => void;
    value?: string;
    keywords?: string[];
    forceMount?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof Primitive.div>, 'disabled' | 'onSelect' | 'value'>;

const Item = React.forwardRef<HTMLDivElement, ItemProps>((props, forwardedRef) => {
    const id = React.useId();
    const ref = React.useRef<HTMLDivElement>(null);
    const groupContext = React.useContext(GroupContext);
    const context = useCommand();
    const propsRef = useAsRef(props);
    const forceMount = propsRef.current?.forceMount ?? groupContext?.forceMount;

    React.useLayoutEffect(() => {
        if (!forceMount) {
            return context.item(id, groupContext?.id);
        }
    }, [forceMount]);

    const value = useValue(id, ref, [props.value, props.children, ref], props.keywords);

    const store = useStore();
    const selected = useCmdk((state) => state.value && state.value === value.current);
    const render = useCmdk((state) =>
        forceMount ? true : context.filter() === false ? true : !state.search ? true : state.filtered.items.get(id) > 0
    );

    React.useEffect(() => {
        const element = ref.current;
        if (!element || props.disabled) return;
        element.addEventListener('cmdk-item-select', onSelect);
        return () => element.removeEventListener('cmdk-item-select', onSelect);
    }, [render, props.onSelect, props.disabled]);

    function onSelect() {
        select();
        propsRef.current.onSelect?.(value.current);
    }

    function select() {
        store.setState('value', value.current, true);
    }

    if (!render) return null;

    const { disabled, value: _, onSelect: __, forceMount: ___, keywords: ____, ...etc } = props;

    return (
        <Primitive.div
            ref={mergeRefs([ref, forwardedRef])}
            {...etc}
            id={id}
            cmdk-item=""
            role="option"
            aria-disabled={Boolean(disabled)}
            aria-selected={Boolean(selected)}
            data-disabled={Boolean(disabled)}
            data-selected={Boolean(selected)}
            onPointerMove={disabled || context.disablePointerSelection ? undefined : select}
            onClick={disabled ? undefined : onSelect}
        >
            {props.children}
        </Primitive.div>
    );
});

export { Item };
