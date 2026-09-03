import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { getApiUrl } from "@/lib/api";

export const metadata = {
  title: "Países | Gemflix",
};

async function getCountries() {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}/play/explore/countries?limit=100`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    return [];
  }
}

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <div className="min-h-screen bg-ui-bg text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Países</h1>
          <p className="text-gray-400">Explora contenido por país de origen.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {countries.map((country: any) => (
            <Link 
              key={country.id} 
              href={`/play/movies?country=${country.id}`}
              className="group flex flex-col items-center p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-red-500 hover:bg-gray-800 transition-all"
            >
              <div className="w-16 h-16 relative rounded-full overflow-hidden mb-3 bg-[#111]">
                {country.logo_path ? (
                  <Image
                    src={country.logo_path}
                    alt={country.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                    {country.iso_3166_1}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold text-center text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                {country.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
