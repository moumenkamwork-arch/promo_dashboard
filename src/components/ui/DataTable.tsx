import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { TableSkeleton } from './Skeleton';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  skeletonCols?: number;
}

export function DataTable<T>({ columns, data, loading, empty, onRowClick, skeletonCols }: DataTableProps<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (loading) return <TableSkeleton cols={skeletonCols ?? columns.length} />;
  if (!data.length && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-line bg-surface-1">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap px-5 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-ink-faint"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-line">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                'bg-surface-1 transition-colors hover:bg-surface-2',
                onRowClick && 'cursor-pointer',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-5 py-3.5 text-ink">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
