interface DevicesOsWidgetProps {
  devices: {
    desktop: { count: number; percent: number };
    mobile: { count: number; percent: number };
    tablet: { count: number; percent: number };
  };
  os: {
    name: string;
    count: number;
    icon: React.ElementType;
    color: string;
  }[];
}

export function DevicesOsWidget({ devices, os }: DevicesOsWidgetProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* DEVICES */}
      <div className="glass-panel p-6 border border-white/5 h-1/2 flex flex-col justify-center relative overflow-hidden">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Distribución por Dispositivos</h2>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-3 h-3 rounded bg-cyan-400"></div> Desktop
            </div>
            <div className="text-right">
              <span className="text-white font-medium">{devices.desktop.count.toLocaleString()}</span>
              <span className="text-gray-500 text-xs ml-2">({devices.desktop.percent}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-3 h-3 rounded bg-purple-400"></div> Mobile
            </div>
            <div className="text-right">
              <span className="text-white font-medium">{devices.mobile.count.toLocaleString()}</span>
              <span className="text-gray-500 text-xs ml-2">({devices.mobile.percent}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-3 h-3 rounded bg-gray-400"></div> Tablet
            </div>
            <div className="text-right">
              <span className="text-white font-medium">{devices.tablet.count.toLocaleString()}</span>
              <span className="text-gray-500 text-xs ml-2">({devices.tablet.percent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* OS */}
      <div className="glass-panel p-6 border border-white/5 h-1/2 flex flex-col overflow-hidden">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Sistemas Operativos</h2>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {os.map((osItem, idx) => (
            <div key={idx} className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <osItem.icon size={16} className={osItem.color} />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{osItem.name}</span>
              </div>
              <span className="text-sm font-mono text-cyan-400">{osItem.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
