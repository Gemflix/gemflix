import CatalogView from "@/components/play/catalog/CatalogView";

export const metadata = {
  title: "Películas | Gemflix",
};

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <CatalogView 
      title="Películas" 
      description="Explora nuestra colección completa de películas." 
      endpoint="movies" 
      basePath="movie" 
      searchParams={resolvedParams} 
    />
  );
}
