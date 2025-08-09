import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
}

export default function DataTable<T>({ columns, data, onEdit, onDelete, pagination, onPageChange, onSearch, searchPlaceholder }: DataTableProps<T>) {
  return (
    <div className="space-y-3">
      {onSearch && (
        <div className="flex justify-end">
          <input className="border rounded px-3 py-2 text-sm" placeholder={searchPlaceholder || 'Search...'} onChange={(e) => onSearch?.(e.target.value)} />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={String(col.key)} className="text-left font-medium py-2 px-3">{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th className="py-2 px-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/50">
                {columns.map(col => (
                  <td key={String(col.key)} className="py-2 px-3">{col.render ? col.render(row) : String((row as any)[col.key])}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      {onEdit && <button className="border rounded px-2 py-1" onClick={() => onEdit(row)} aria-label="Edit">Edit</button>}
                      {onDelete && <button className="border rounded px-2 py-1" onClick={() => onDelete(row)} aria-label="Delete">Delete</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <div className="flex items-center justify-between text-xs">
          <div>Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}</div>
          <div className="flex gap-2">
            <button className="border rounded px-2 py-1" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Prev</button>
            <button className="border rounded px-2 py-1" disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => onPageChange(pagination.page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
} 