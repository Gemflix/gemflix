import { Globe } from "lucide-react";

interface BrowsersBrandingWidgetProps {
  browsers: {
    name: string;
    count: number;
    icon: React.ElementType;
    color: string;
  }[];
}

export function BrowsersBrandingWidget({ browsers }: BrowsersBrandingWidgetProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* BROWSERS */}
      <div className="glass-panel p-6 border border-white/5 h-1/2 flex flex-col">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Navegadores Principales</h2>
        <div className="space-y-4">
          {browsers.map((browser, idx) => (
            <div key={idx} className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-white/5 ${browser.color}`}>
                  <browser.icon size={18} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{browser.name}</span>
              </div>
              <span className="text-sm font-mono text-cyan-400">{browser.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BRANDING WIDGET */}
      <div className="glass-panel p-6 border border-cyan-500/20 h-1/2 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-900/40 to-blue-900/40 opacity-50 z-0"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 p-1 mb-4 animate-pulse">
            <div className="w-full h-full bg-[#11131a] rounded-full flex items-center justify-center">
              <Globe size={40} className="text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
            GEMFLIX IP ANALYTICS
          </h3>
          <p className="text-xs text-cyan-400/60 mt-1 uppercase tracking-widest">
            Monitoreo Global Activo
          </p>
        </div>
      </div>
    </div>
  );
}
