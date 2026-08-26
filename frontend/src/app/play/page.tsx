"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Loader2 } from "lucide-react";
import { HomeTabs } from "@/components/play/home/HomeTabs";
import { HeroCarousel } from "@/components/play/home/HeroCarousel";
import { MediaRow } from "@/components/play/home/MediaRow";

interface MediaItem {
  id: number;
  title: string;
  slug: string;
  poster: string;
}

interface RowData {
  title: string;
  items: MediaItem[];
  row_type?: "episodes" | "continue" | "posters";
}

interface TabData {
  id: string;
  label: string;
}

interface HomeData {
  hero: {
    title: string;
    overview: string;
    backdrop: string;
    poster?: string;
  };
  rows: RowData[];
  tabs: TabData[];
}

export default function PlayPage() {
  const { theme } = useTheme();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("movies");

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/play/home?viewMode=${viewMode}`, { credentials: "include" });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Error cargando el catálogo.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">

      {/* Main Content Area */}
      {loading && !data ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : error && !data ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-gray-400">{error}</p>
        </div>
      ) : data ? (
        <div className="pt-28 animate-in fade-in duration-500 max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          
          {/* Tabs At The Top */}
          <div className="mt-2 mb-6">
            <HomeTabs 
              tabs={data.tabs || []} 
              activeTab={viewMode} 
              onTabChange={setViewMode} 
            />
          </div>

          {/* Hero Carousel Below Tabs */}
          <div className="mb-12">
            <HeroCarousel hero={data.hero} viewMode={viewMode} />
          </div>
          
          {/* Media Rows */}
          <div className="space-y-4 pb-4">
            {data.rows?.map((row, idx) => (
              <MediaRow 
                key={idx} 
                title={row.title} 
                items={row.items} 
                rowType={row.row_type} 
              />
            ))}
          </div>

        </div>
      ) : null}
    </div>
  );
}
