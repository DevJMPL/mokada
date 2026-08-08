import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
}

export function Table<T>({ 
  data, 
  columns, 
  isLoading, 
  isEmpty, 
  emptyTitle, 
  emptyMessage 
}: TableProps<T>) {
  if (isLoading) {
    return <LoadingState message="Cargando datos..." />;
  }

  if (isEmpty || (!isLoading && data.length === 0)) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.cell ? col.cell(row) : col.accessorKey ? (row[col.accessorKey] as React.ReactNode) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
