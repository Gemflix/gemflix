import Link from "next/link";
import Image from "next/image";

type MediaItem = {
  id: number;
  slug: string;
  title: string;
  poster_path: string | null;
  views: number;
  vote_average?: number;
};

export default function MediaGrid({ items, basePath }: { items: MediaItem[], basePath: string }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p className="text-lg">No se encontraron resultados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Link 
          key={item.id} 
          href={`/play/${basePath}/${item.slug}`}
          className="group relative flex flex-col gap-2 rounded-lg overflow-hidden"
        >
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
            {item.poster_path ? (
              <Image
                src={item.poster_path}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                <span>Sin Imagen</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            {item.vote_average !== undefined && item.vote_average > 0 && (
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-semibold text-gray-200 line-clamp-1 group-hover:text-red-500 transition-colors">
            {item.title}
          </h3>
        </Link>
      ))}
    </div>
  );
}
