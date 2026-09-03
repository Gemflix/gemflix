import ThemeProvider, { ThemeConfig } from "./ThemeProvider";
import { Navbar } from "@/components/play/navigation/Navbar";
import { getApiUrl } from "@/lib/api";

async function getGlobalTheme(): Promise<ThemeConfig> {
  const defaultTheme: ThemeConfig = {
    primaryColor: "#f97316",
    backgroundColor: "#0f1115",
    borderRadius: "0.5rem"
  };

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/play/settings`, { 
      cache: "no-store" 
    });
    if (res.ok) {
      const data = await res.json();
      if (data.theme_config) {
        const config = JSON.parse(data.theme_config);
        return { ...defaultTheme, ...config };
      }
    }
  } catch (e) {
    console.error("Error fetching global theme:", e);
  }
  
  return defaultTheme;
}

export default async function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalTheme = await getGlobalTheme();

  return (
    <ThemeProvider globalTheme={globalTheme}>
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
    </ThemeProvider>
  );
}
