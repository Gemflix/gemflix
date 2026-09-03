import { Activity, Laptop, Smartphone, Tablet } from "lucide-react";

interface SummaryWidgetProps {
  total_visits: number;
  devices: {
    desktop: { count: number; percent: number };
    mobile: { count: number; percent: number };
    tablet: { count: number; percent: number };
  };
}

export function SummaryWidget({ total_visits, devices }: SummaryWidgetProps) {
  return (
    <div className="glass-panel p-6 border border-cyan-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-cyan-400 font-semibold tracking-wide text-sm">VISITAS TOTALES</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{total_visits.toLocaleString()}</span>
              <span className="text-gray-400 font-medium">visitas</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 lg:gap-16">
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-gray-400 mb-1">
              <Laptop size={16} /> Desktop
            </div>
            <p className="text-2xl font-bold text-white">{devices.desktop.count.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-gray-400 mb-1">
              <Smartphone size={16} /> Mobile
            </div>
            <p className="text-2xl font-bold text-white">{devices.mobile.count.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-gray-400 mb-1">
              <Tablet size={16} /> Tablet
            </div>
            <p className="text-2xl font-bold text-white">{devices.tablet.count.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
