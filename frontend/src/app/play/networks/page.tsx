import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Plataformas | Gemflix",
};

async function getNetworks() {
  const url = `http://localhost:8080/api/play/explore/networks?limit=100`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch networks:", error);
    return [];
  }
}

export default async function NetworksPage() {
  const networks = await getNetworks();

  return (
    <div className="min-h-screen bg-ui-bg text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Plataformas</h1>
          <p className="text-gray-400">Encuentra producciones originales de tus plataformas favoritas.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {networks.map((network: any) => (
            <Link 
              key={network.id} 
              href={`/play/movies?network=${network.id}`}
              className="group relative h-24 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center p-4"
            >
              {network.poster_path ? (
                <Image
                  src={network.poster_path}
                  alt={network.name}
                  fill
                  className="object-contain p-4 filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <h3 className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors text-center">
                  {network.name}
                </h3>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
