import * as React from 'react';

export const useCommand = () => React.useContext(CommandContext);
export const useStore = () => React.useContext(StoreContext); // @ts-ignore
// @ts-ignore
export const CommandContext = React.createContext<Context>(undefined)
// @ts-ignore
export const StoreContext = React.createContext<Store>(undefined)
// @ts-ignore
export const GroupContext = React.createContext<Group>(undefined)

