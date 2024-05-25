import React from 'react';

type Group = {
    id: string;
    forceMount?: boolean;
};

const GroupContext = React.createContext<Group>(undefined);

export { GroupContext };

export type { Group };
