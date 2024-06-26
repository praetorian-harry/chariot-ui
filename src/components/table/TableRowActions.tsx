import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '../Dropdown';

import { ActionsWithRowSelection } from './types';
import { mapActionsWithRowSelection } from './util';

interface TableRowActionsProps<TData> {
  selectedRows: string[];
  data: TData[];
  rowData: TData;
  rowActions: ActionsWithRowSelection<TData>;
}

export function TableRowActions<TData>(props: TableRowActionsProps<TData>) {
  const { selectedRows, data, rowData, rowActions } = props;

  const rowActionProps = mapActionsWithRowSelection<TData>(
    selectedRows,
    data,
    rowData,
    false,
    rowActions
  );

  if (!rowActionProps) {
    return null;
  }

  return (
    <Dropdown
      onClick={event => {
        event.stopPropagation();
      }}
      startIcon={
        <EllipsisVerticalIcon className="m-auto size-6 text-default-light" />
      }
      styleType="none"
      menu={rowActionProps}
    />
  );
}
