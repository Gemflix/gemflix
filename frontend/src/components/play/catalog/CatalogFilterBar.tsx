"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

interface FilterOption {
  id: number | string;
  name: string;
}

export default function CatalogFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [genres, setGenres] = useState<FilterOption[]>([]);
  const [networks, setNetworks] = useState<FilterOption[]>([]);
  const [countries, setCountries] = useState<FilterOption[]>([]);

  const isMovies = pathname.includes("/movies");

  useEffect(() => {
    Promise.all([
      fetch("/api/play/explore/genres?limit=100").then(res => res.json()),
      fetch("/api/play/explore/networks?limit=100").then(res => res.json()),
      fetch("/api/play/explore/countries?limit=100").then(res => res.json())
    ]).then(([gData, nData, cData]) => {
      setGenres(gData || []);
      setNetworks(nData || []);
      setCountries(cData || []);
    }).catch(console.error);
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString(name, value));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("q", q);
  };

  return (
    <div className="pb-4">
      {/* Search Bar */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="col-span-1 md:col-span-2 relative flex">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar ${isMovies ? 'películas' : 'series'}...`}
            className="w-full bg-[#111] text-gray-200 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <button 
          type="button" 
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="md:hidden flex items-center justify-center px-4 py-2 bg-[#111] text-gray-300 border border-gray-700 rounded-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </button>

        {/* Desktop Filters (or Mobile when open) */}
        <div className={`col-span-1 md:col-span-2 md:flex gap-2 ${mobileFiltersOpen ? 'flex flex-col' : 'hidden'}`}>
          <select 
            value={searchParams.get("cat") || ""}
            onChange={(e) => handleFilterChange("cat", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todas las categorías</option>
            {isMovies ? (
              <>
                <option value="movie">Película</option>
                <option value="anime">Anime</option>
                <option value="live">Live Action</option>
              </>
            ) : (
              <>
                <option value="serie">Serie</option>
                <option value="anime">Anime</option>
                <option value="donghua">Donghua</option>
                <option value="novela">Novela</option>
                <option value="dorama">Dorama</option>
              </>
            )}
          </select>

          <select 
            value={searchParams.get("sort") || ""}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Ordenar por...</option>
            <option value="recent">Más recientes</option>
            <option value="popular">Más populares</option>
            <option value="rating">Mejor valorados</option>
            <option value="views">Más vistos</option>
          </select>

          <select 
            value={searchParams.get("genreId") || ""}
            onChange={(e) => handleFilterChange("genreId", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todos los Géneros</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select 
            value={searchParams.get("networkId") || ""}
            onChange={(e) => handleFilterChange("networkId", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todas las Plataformas</option>
            {networks.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>

          <select 
            value={searchParams.get("countryId") || ""}
            onChange={(e) => handleFilterChange("countryId", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Cualquier País</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          <select 
            value={searchParams.get("year") || ""}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="bg-[#111] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Cualquier Año</option>
            {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
