import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { CommandContext, useCommand, ContextType } from './CommandContext';
import { StoreContext, useStore, State, Store } from './StoreContext';
import { GroupContext } from './GroupContext';
import {
    defaultFilter,
    useLazyRef,
    useScheduleLayoutEffect,
    useAsRef,
    useCmdk,
    mergeRefs,
    SlottableWithNestedChildren,
    findNextSibling,
    findPreviousSibling,
    useValue,
} from './utils';

type CommandProps = {
    children?: React.ReactNode;
    label?: string;
    shouldFilter?: boolean;
    filter?: (value: string, search: string, keywords?: string[]) => number;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    loop?: boolean;
    disablePointerSelection?: boolean;
    vimBindings?: boolean;
} & React.ComponentPropsWithoutRef<typeof Primitive.div>;

const Command = React.forwardRef<HTMLDivElement, CommandProps>((props, forwardedRef) => {
    const state = useLazyRef<State>(() => ({
        search: '',
        value: props.value ?? props.defaultValue ?? '',
        filtered: {
            count: 0,
            items: new Map(),
            groups: new Set(),
        },
    }));
    const allItems = useLazyRef<Set<string>>(() => new Set());
    const allGroups = useLazyRef<Map<string, Set<string>>>(() => new Map());
    const ids = useLazyRef<Map<string, { value: string; keywords?: string[] }>>(() => new Map());
    const listeners = useLazyRef<Set<() => void>>(() => new Set());
    const propsRef = useAsRef(props);
    const { label, children, value, onValueChange, filter, shouldFilter, loop, disablePointerSelection = false, vimBindings = true, ...etc } = props;

    const listId = React.useId();
    const labelId = React.useId();
    const inputId = React.useId();
    const listInnerRef = React.useRef<HTMLDivElement>(null);
    const schedule = useScheduleLayoutEffect();

    React.useLayoutEffect(() => {
        if (value !== undefined) {
            const v = value.trim();
            state.current.value = v;
            store.emit();
        }
    }, [value]);

    React.useLayoutEffect(() => {
        schedule(6, scrollSelectedIntoView);
    }, []);

    const store: Store = React.useMemo(() => {
        return {
            subscribe: (cb) => {
                listeners.current.add(cb);
                return () => listeners.current.delete(cb);
            },
            snapshot: () => state.current,
            setState: (key, value, opts) => {
                if (Object.is(state.current[key], value)) return;
                state.current[key] = value;
                if (key === 'search') {
                    filterItems();
                    sort();
                    schedule(1, selectFirstItem);
                } else if (key === 'value') {
                    if (!opts) {
                        schedule(5, scrollSelectedIntoView);
                    }
                    if (propsRef.current?.value !== undefined) {
                        const newValue = String(value ?? '');
                        propsRef.current.onValueChange?.(newValue);
                        return;
                    }
                }
                store.emit();
            },
            emit: () => {
                listeners.current.forEach((l) => l());
            },
        };
    }, []);

    const context: ContextType = React.useMemo(
        () => ({
            value: (id, value, keywords) => {
                if (value !== ids.current.get(id)?.value) {
                    ids.current.set(id, { value, keywords });
                    state.current.filtered.items.set(id, score(value, keywords));
                    schedule(2, () => {
                        sort();
                        store.emit();
                    });
                }
            },
            item: (id, groupId) => {
                allItems.current.add(id);
                if (groupId) {
                    if (!allGroups.current.has(groupId)) {
                        allGroups.current.set(groupId, new Set([id]));
                    } else {
                        allGroups.current.get(groupId).add(id);
                    }
                }
                schedule(3, () => {
                    filterItems();
                    sort();
                    if (!state.current.value) {
                        selectFirstItem();
                    }
                    store.emit();
                });
                return () => {
                    ids.current.delete(id);
                    allItems.current.delete(id);
                    state.current.filtered.items.delete(id);
                    const selectedItem = getSelectedItem();
                    schedule(4, () => {
                        filterItems();
                        if (selectedItem?.getAttribute('id') === id) selectFirstItem();
                        store.emit();
                    });
                };
            },
            group: (id) => {
                if (!allGroups.current.has(id)) {
                    allGroups.current.set(id, new Set());
                }
                return () => {
                    ids.current.delete(id);
                    allGroups.current.delete(id);
                };
            },
            filter: () => propsRef.current.shouldFilter,
            label: label || props['aria-label'],
            disablePointerSelection,
            listId,
            inputId,
            labelId,
            listInnerRef,
        }),
        []
    );

    function score(value: string, keywords?: string[]) {
        const filter = propsRef.current?.filter ?? defaultFilter;
        return value ? filter(value, state.current.search, keywords) : 0;
    }

    function sort() {
        if (!state.current.search || propsRef.current.shouldFilter === false) {
            return;
        }
        const scores = state.current.filtered.items;
        const groups: [string, number][] = [];
        state.current.filtered.groups.forEach((value) => {
            const items = allGroups.current.get(value);
            let max = 0;
            items.forEach((item) => {
                const score = scores.get(item);
                max = Math.max(score, max);
            });
            groups.push([value, max]);
        });
        const listInsertionElement = listInnerRef.current;
        getValidItems()
            .sort((a, b) => {
                const valueA = a.getAttribute('id');
                const valueB = b.getAttribute('id');
                return (scores.get(valueB) ?? 0) - (scores.get(valueA) ?? 0);
            })
            .forEach((item) => {
                const group = item.closest('[cmdk-group-items=""]');
                if (group) {
                    group.appendChild(item.parentElement === group ? item : item.closest('[cmdk-group-items=""] > *'));
                } else {
                    listInsertionElement.appendChild(
                        item.parentElement === listInsertionElement ? item : item.closest('[cmdk-group-items=""] > *')
                    );
                }
            });
        groups
            .sort((a, b) => b[1] - a[1])
            .forEach((group) => {
                const element = listInnerRef.current?.querySelector(`[cmdk-group=""][data-value="${encodeURIComponent(group[0])}"]`);
                element?.parentElement.appendChild(element);
            });
    }

    function selectFirstItem() {
        const item = getValidItems().find((item) => item.getAttribute('aria-disabled') !== 'true');
        const value = item?.getAttribute('data-value');
        store.setState('value', value || undefined);
    }

    function filterItems() {
        if (!state.current.search || propsRef.current.shouldFilter === false) {
            state.current.filtered.count = allItems.current.size;
            return;
        }
        state.current.filtered.groups = new Set();
        let itemCount = 0;
        for (const id of allItems.current) {
            const value = ids.current.get(id)?.value ?? '';
            const keywords = ids.current.get(id)?.keywords ?? [];
            const rank = score(value, keywords);
            state.current.filtered.items.set(id, rank);
            if (rank > 0) itemCount++;
        }
        for (const [groupId, group] of allGroups.current) {
            for (const itemId of group) {
                if (state.current.filtered.items.get(itemId) > 0) {
                    state.current.filtered.groups.add(groupId);
                    break;
                }
            }
        }
        state.current.filtered.count = itemCount;
    }

    function scrollSelectedIntoView() {
        const item = getSelectedItem();
        if (item) {
            if (item.parentElement?.firstChild === item) {
                item.closest('[cmdk-group=""]')?.querySelector('[cmdk-group-heading=""]')?.scrollIntoView({ block: 'nearest' });
            }
            item.scrollIntoView({ block: 'nearest' });
        }
    }

    function getSelectedItem() {
        return listInnerRef.current?.querySelector('[cmdk-item=""][aria-selected="true"]');
    }

    function getValidItems() {
        return Array.from(listInnerRef.current?.querySelectorAll('[cmdk-item=""]:not([aria-disabled="true"])') || []);
    }

    function updateSelectedToIndex(index: number) {
        const items = getValidItems();
        const item = items[index];
        if (item) store.setState('value', item.getAttribute('data-value'));
    }

    function updateSelectedByItem(change: 1 | -1) {
        const selected = getSelectedItem();
        const items = getValidItems();
        const index = items.findIndex((item) => item === selected);
        let newSelected = items[index + change];
        if (propsRef.current?.loop) {
            newSelected =
                index + change < 0 ? items[items.length - 1] : index + change === items.length ? items[0] : items[index + change];
        }
        if (newSelected) store.setState('value', newSelected.getAttribute('data-value'));
    }

    function updateSelectedByGroup(change: 1 | -1) {
        const selected = getSelectedItem();
        let group = selected?.closest('[cmdk-group=""]');
        let item: HTMLElement;
        while (group && !item) {
            group = change > 0 ? findNextSibling(group, '[cmdk-group=""]') : findPreviousSibling(group, '[cmdk-group=""]');
            item = group?.querySelector('[cmdk-item=""]:not([aria-disabled="true"])');
        }
        if (item) {
            store.setState('value', item.getAttribute('data-value'));
        } else {
            updateSelectedByItem(change);
        }
    }

    const last = () => updateSelectedToIndex(getValidItems().length - 1);

    const next = (e: React.KeyboardEvent) => {
        e.preventDefault();
        if (e.metaKey) {
            last();
        } else if (e.altKey) {
            updateSelectedByGroup(1);
        } else {
            updateSelectedByItem(1);
        }
    };

    const prev = (e: React.KeyboardEvent) => {
        e.preventDefault();
        if (e.metaKey) {
            updateSelectedToIndex(0);
        } else if (e.altKey) {
            updateSelectedByGroup(-1);
        } else {
            updateSelectedByItem(-1);
        }
    };

    return (
        <Primitive.div
            ref={forwardedRef}
            tabIndex={-1}
            {...etc}
            cmdk-root=""
            onKeyDown={(e) => {
                etc.onKeyDown?.(e);
                if (!e.defaultPrevented) {
                    switch (e.key) {
                        case 'n':
                        case 'j': {
                            if (vimBindings && e.ctrlKey) {
                                next(e);
                            }
                            break;
                        }
                        case 'ArrowDown': {
                            next(e);
                            break;
                        }
                        case 'p':
                        case 'k': {
                            if (vimBindings && e.ctrlKey) {
                                prev(e);
                            }
                            break;
                        }
                        case 'ArrowUp': {
                            prev(e);
                            break;
                        }
                        case 'Home': {
                            e.preventDefault();
                            updateSelectedToIndex(0);
                            break;
                        }
                        case 'End': {
                            e.preventDefault();
                            last();
                            break;
                        }
                        case 'Enter': {
                            if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
                                e.preventDefault();
                                const item = getSelectedItem();
                                if (item) {
                                    const event = new Event('cmdk-item-select');
                                    item.dispatchEvent(event);
                                }
                            }
                        }
                    }
                }
            }}
        >
            <label
                cmdk-label=""
                htmlFor={context.inputId}
                id={context.labelId}
                style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}
            >
                {label}
            </label>
            {SlottableWithNestedChildren(props, (child) => (
                <StoreContext.Provider value={store}>
                    <CommandContext.Provider value={context}>{child}</CommandContext.Provider>
                </StoreContext.Provider>
            ))}
        </Primitive.div>
    );
});

export { Command };
