import { Suspense } from "react";
import CatalogView from "@/components/play/catalog/CatalogView";

export const metadata = {
  title: "Series | Gemflix",
};

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <CatalogView 
      title="Series y TV" 
      description="Explora los mejores programas y series de televisión." 
      endpoint="series" 
      basePath="serie" 
      searchParams={resolvedParams} 
    />
  );
}
