import React from 'react';

type State = {
    search: string;
    value: string;
    filtered: { count: number; items: Map<string, number>; groups: Set<string> };
};

type Store = {
    subscribe: (callback: () => void) => () => void;
    snapshot: () => State;
    setState: <K extends keyof State>(key: K, value: State[K], opts?: any) => void;
    emit: () => void;
};

const StoreContext = React.createContext<Store>(undefined);
const useStore = () => React.useContext(StoreContext);

export { StoreContext, useStore };

export type { State, Store };