import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export const metadata = {
  title: "Reparto | Gemflix",
};

async function getCasts(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q as string);
  if (searchParams.limit) params.set("limit", searchParams.limit as string);
  if (searchParams.offset) params.set("offset", searchParams.offset as string);
  
  const apiUrl = getApiUrl();
  const url = `${apiUrl}/api/play/explore/casts?${params.toString()}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch casts:", error);
    return [];
  }
}

export default async function CastsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const casts = await getCasts(resolvedParams);

  return (
    <div className="min-h-screen bg-ui-bg text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Actores y Directores</h1>
          <p className="text-gray-400">Descubre las mentes y rostros detrás de tus producciones favoritas.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {casts.map((cast: any) => (
            <Link 
              key={cast.id} 
              href={`/play/cast/${cast.id}`}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-2/3 relative rounded-lg overflow-hidden mb-3 bg-gray-900 border border-gray-800 shadow-lg">
                {cast.profile_path ? (
                  <Image
                    src={cast.profile_path}
                    alt={cast.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#111]">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">Sin foto</span>
                  </div>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-red-500/50 rounded-lg transition-colors"></div>
              </div>
              <h3 className="text-sm font-bold text-center text-gray-200 group-hover:text-red-500 transition-colors line-clamp-1">
                {cast.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{cast.known_for_department || 'Acting'}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
