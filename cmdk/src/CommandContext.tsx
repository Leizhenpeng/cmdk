import React from 'react';

export type ContextType = {
    value: (id: string, value: string, keywords?: string[]) => void;
    item: (id: string, groupId: string) => () => void;
    group: (id: string) => () => void;
    filter: () => boolean;
    label: string;
    disablePointerSelection: boolean;
    listId: string;
    labelId: string;
    inputId: string;
    listInnerRef: React.RefObject<HTMLDivElement | null>;
};

const CommandContext = React.createContext<ContextType>(undefined);
const useCommand = () => React.useContext(CommandContext);

export { CommandContext, useCommand, };
