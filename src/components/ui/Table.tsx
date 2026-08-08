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
    <div className="w-full overflow-x-auto border border-gray-200/60 rounded-2xl bg-white shadow-sm">
      <table className="w-full text-[13px] text-left">
        <thead className="bg-white border-b border-gray-200/60 text-[#86868B] font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#F5F5F7]/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-5 py-3.5 ${col.className || ''}`}>
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
