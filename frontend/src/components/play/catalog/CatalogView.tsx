import { Suspense } from "react";
import CatalogFilterBar from "@/components/play/catalog/CatalogFilterBar";
import MediaGrid from "@/components/play/catalog/MediaGrid";

interface CatalogViewProps {
  title: string;
  description: string;
  endpoint: string;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getCatalogData(endpoint: string, searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  
  if (searchParams.q) params.set("q", searchParams.q as string);
  if (searchParams.cat) params.set("cat", searchParams.cat as string);
  if (searchParams.sort) params.set("sort", searchParams.sort as string);
  if (searchParams.genreId) params.set("genreId", searchParams.genreId as string);
  if (searchParams.networkId) params.set("networkId", searchParams.networkId as string);
  if (searchParams.countryId) params.set("countryId", searchParams.countryId as string);
  if (searchParams.year) params.set("year", searchParams.year as string);
  
  const url = `http://localhost:8080/api/play/catalog/${endpoint}?${params.toString()}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
}

export default async function CatalogView({ title, description, endpoint, basePath, searchParams }: CatalogViewProps) {
  const items = await getCatalogData(endpoint, searchParams);

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>

        <Suspense fallback={<div className="h-20 bg-gray-900 rounded-lg animate-pulse mb-8"></div>}>
          <CatalogFilterBar />
        </Suspense>

        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-2/3 bg-gray-900 rounded-lg animate-pulse"></div>
            ))}
          </div>
        }>
          <MediaGrid items={items} basePath={basePath} />
        </Suspense>
      </div>
    </div>
  );
}
