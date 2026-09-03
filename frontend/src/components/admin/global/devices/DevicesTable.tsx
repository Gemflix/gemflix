import { Monitor, Smartphone, Tablet, Tv, Globe } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Device {
  id: number;
  user_email: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'other';
  ip_address: string;
  last_active: string;
  status: 'online' | 'offline';
}

interface DevicesTableProps {
  devices: Device[];
  loading: boolean;
  onRevoke?: (device: Device) => void;
}

export function DevicesTable({ devices, loading, onRevoke }: DevicesTableProps) {
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor size={18} className="text-blue-400" />;
      case 'mobile': return <Smartphone size={18} className="text-emerald-400" />;
      case 'tablet': return <Tablet size={18} className="text-orange-400" />;
      case 'tv': return <Tv size={18} className="text-purple-400" />;
      default: return <Globe size={18} className="text-gray-400" />;
    }
  };

  const columns: Column<Device>[] = [
    {
      key: 'device_name',
      label: 'Dispositivo',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/20 rounded-lg border border-white/5">
            {getDeviceIcon(item.device_type)}
          </div>
          <div>
            <div className="text-white font-medium max-w-xs truncate">{item.device_name}</div>
            <div className="text-xs text-gray-500">{item.user_email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'ip_address',
      label: 'Dirección IP',
      render: (item) => (
        <span className="text-xs font-mono text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">
          {item.ip_address}
        </span>
      )
    },
    {
      key: 'last_active',
      label: 'altima Actividad',
      render: (item) => (
        <span className="text-gray-400 text-sm">{new Date(item.last_active).toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span className={`text-xs px-2 py-1 rounded-full border ${
          item.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }`}>
          {item.status === 'online' ? 'Conectado' : 'Desconectado'}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={devices}
      columns={columns}
      loading={loading}
      emptyIcon={Monitor}
      emptyMessage="No hay dispositivos activos."
      actions={(item) => (
        <button 
          onClick={() => onRevoke?.(item)}
          className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          Revocar Acceso
        </button>
      )}
    />
  );
}
