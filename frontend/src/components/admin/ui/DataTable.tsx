import React from 'react';
import { Search, ChevronLeft, ChevronRight, FileX } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
}

export function DataTable<T extends { id?: number | string | any }>({
  data,
  columns,
  loading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  actions,
  emptyMessage = "No se encontraron registros.",
  emptyIcon: EmptyIcon = FileX
}: DataTableProps<T>) {
  
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="glass-panel overflow-hidden flex flex-col w-full">
      {/* Barra superior de herramientas */}
      {onSearch && (
        <div className="p-4 border-b border-surface-border flex justify-between items-center bg-black/20">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/40 text-xs uppercase text-gray-400 border-b border-white/5">
            <tr>
              {columns.map((col, index) => (
                <th key={String(col.key) + index} className="px-6 py-4 font-medium">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-6 py-4 font-medium text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-medium">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <EmptyIcon size={48} className="text-gray-500/50 mb-4" />
                    <span className="text-gray-400 font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={item.id || rowIndex} className="hover:bg-white/5 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={String(col.key) + colIndex} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {onPageChange && totalItems > pageSize && (
        <div className="p-4 border-t border-surface-border bg-black/20 flex items-center justify-between text-sm text-gray-400">
          <div>
            Mostrando <span className="text-white font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
            <span className="text-white font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
            <span className="text-white font-medium">{totalItems}</span> resultados
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="p-1.5 rounded bg-black/30 border border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-3 py-1 bg-black/30 border border-white/5 rounded">
              Página <span className="text-white font-medium">{currentPage}</span> de {totalPages}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="p-1.5 rounded bg-black/30 border border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
