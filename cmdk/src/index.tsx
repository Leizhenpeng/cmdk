export { Command } from './Command';
export { Item } from './Item';
export { Group } from './Group';
export { Separator } from './Separator';
export { Input } from './Input';
export { List } from './List';
export { Dialog } from './Dialog';
export { Empty } from './Empty';
export { Loading } from './Loading';
export { defaultFilter } from './utils';

export { useCmdk as useCommandState } from './utils';
export { Command as CommandRoot } from './Command';
export { List as CommandList } from './List';
export { Item as CommandItem } from './Item';
export { Input as CommandInput } from './Input';
export { Group as CommandGroup } from './Group';
export { Separator as CommandSeparator } from './Separator';
export { Dialog as CommandDialog } from './Dialog';
export { Empty as CommandEmpty } from './Empty';
export { Loading as CommandLoading } from './Loading';

export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
} as const
