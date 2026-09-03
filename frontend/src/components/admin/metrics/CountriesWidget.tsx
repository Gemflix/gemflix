interface Country {
  code: string;
  name: string;
  count: number;
  percent: number;
  flag: string;
}

interface CountriesWidgetProps {
  countries: Country[];
}

export function CountriesWidget({ countries }: CountriesWidgetProps) {
  return (
    <div className="glass-panel p-6 border border-white/5 flex flex-col h-125">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">Países con mayor actividad</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
        {countries.map((country, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="text-xl w-6 text-center">{country.flag}</div>
            <div className="w-24 text-sm font-medium text-gray-200">{country.name}</div>
            <div className="flex-1">
              <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-linear-to-r from-cyan-600 to-cyan-400"
                  style={{ width: `${country.percent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
