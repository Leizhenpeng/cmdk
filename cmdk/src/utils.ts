import * as React from 'react';

export const defaultFilter = (value: string, search: string, keywords?: string[]) => {
    // Add your command score logic here
    return 1; // This should be replaced by actual command scoring logic
};

export const useLazyRef = <T,>(fn: () => T) => {
    const ref = React.useRef<T>();
    if (ref.current === undefined) {
        ref.current = fn();
    }
    return ref as React.MutableRefObject<T>;
};

export const useScheduleLayoutEffect = () => {
    const [s, ss] = React.useState<object>();
    const fns = useLazyRef(() => new Map<string | number, () => void>());
    React.useLayoutEffect(() => {
        fns.current.forEach((f) => f());
        fns.current = new Map();
    }, [s]);
    return (id: string | number, cb: () => void) => {
        fns.current.set(id, cb);
        ss({});
    };
};

export const useAsRef = <T,>(data: T) => {
    const ref = React.useRef<T>(data);
    React.useLayoutEffect(() => {
        ref.current = data;
    });
    return ref;
};

export const useCmdk = <T = any>(selector: (state: any) => T) => {
    const store = React.useContext<any>(null); // This should be StoreContext
    const cb = () => selector(store.snapshot());
    return React.useSyncExternalStore(store.subscribe, cb, cb);
};

export const useValue = (
    id: string,
    ref: React.RefObject<HTMLElement>,
    deps: (string | React.ReactNode | React.RefObject<HTMLElement>)[],
    aliases: string[] = []
) => {
    const valueRef = React.useRef<string>();
    const context = React.useContext<any>(null); // This should be CommandContext
    React.useLayoutEffect(() => {
        const value = (() => {
            for (const part of deps) {
                if (typeof part === 'string') {
                    return part.trim();
                }
                if (typeof part === 'object' && 'current' in part) {
                    if (part.current) {
                        return part.current.textContent?.trim();
                    }
                    return valueRef.current;
                }
            }
        })();
        const keywords = aliases.map((alias) => alias.trim());
        context.value(id, value, keywords);
        ref.current?.setAttribute('data-value', value);
        valueRef.current = value;
    });
    return valueRef;
};

export const mergeRefs = <T = any>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T> => {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
};

export const SlottableWithNestedChildren = (
    { asChild, children }: { asChild?: boolean; children?: React.ReactNode },
    render: (child: React.ReactNode) => JSX.Element
) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(renderChildren(children), { ref: (children as any).ref }, render(children.props.children));
    }
    return render(children);
};

const renderChildren = (children: React.ReactElement) => {
    const childrenType = children.type as any;
    if (typeof childrenType === 'function') return childrenType(children.props);
    else if ('render' in childrenType) return childrenType.render(children.props);
    else return children;
};

export const findNextSibling = (el: Element, selector: string) => {
    let sibling = el.nextElementSibling;
    while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling.nextElementSibling;
    }
    return null;
};

export const findPreviousSibling = (el: Element, selector: string) => {
    let sibling = el.previousElementSibling;
    while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling.previousElementSibling;
    }
    return null;
};
