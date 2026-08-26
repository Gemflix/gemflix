import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Colecciones | Gemflix",
};

async function getCollections(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  if (searchParams.limit) params.set("limit", searchParams.limit as string);
  if (searchParams.offset) params.set("offset", searchParams.offset as string);
  
  const url = `http://localhost:8080/api/play/explore/collections?${params.toString()}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const collections = await getCollections(resolvedParams);

  return (
    <div className="min-h-screen bg-ui-bg text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Colecciones</h1>
          <p className="text-gray-400">Descubre sagas y universos cinematográficos completos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col: any) => (
            <Link 
              key={col.id} 
              href={`/play/collection/${col.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[16/9] bg-gray-900 border border-gray-800"
            >
              {col.backdrop_path ? (
                <Image
                  src={col.backdrop_path}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
              ) : col.poster_path ? (
                <Image
                  src={col.poster_path}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">Sin Imagen</div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors drop-shadow-md">
                  {col.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
