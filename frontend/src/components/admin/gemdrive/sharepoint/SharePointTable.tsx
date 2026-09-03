import { FolderKey, Link, Database } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface SharePointSite {
  id: number;
  account_email: string;
  site_name: string;
  site_id: string;
  drive_id: string;
  status: string;
}

interface SharePointTableProps {
  sites: SharePointSite[];
  loading: boolean;
  onEdit?: (site: SharePointSite) => void;
}

export function SharePointTable({ sites, loading, onEdit }: SharePointTableProps) {
  
  const columns: Column<SharePointSite>[] = [
    {
      key: 'site_name',
      label: 'Sitio SharePoint',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <FolderKey size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-base">{item.site_name}</div>
            <div className="text-xs text-gray-500">{item.account_email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'site_id',
      label: 'Site ID / Drive ID',
      render: (item) => (
        <div className="text-xs font-mono text-gray-400 bg-black/30 p-2 rounded border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5"><Link size={12} className="text-accent" /> {item.site_id.split(',')[1] || item.site_id}</div>
          <div className="flex items-center gap-1.5"><Database size={12} className="text-accent" /> {item.drive_id}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
          'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={sites}
      columns={columns}
      loading={loading}
      emptyIcon={FolderKey}
      emptyMessage="No hay sitios SharePoint enlazados."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Editar
        </button>
      )}
    />
  );
}
