import useSWR, { SWRConfiguration } from 'swr';
import { getApiUrl, apiFetch } from '@/lib/api';

interface UseApiOptions extends SWRConfiguration {
  query?: Record<string, string | number | boolean>;
}

export const fetcher = async (url: string) => {
  const res = await apiFetch(url);
  if (!res.ok) {
    const error: any = new Error('Ocurrió un error al cargar los datos.');
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export function useApi<Data = any>(
  endpoint: string | null,
  options?: UseApiOptions
) {
  // Construir la URL completa
  const url = endpoint ? `${getApiUrl()}/api${endpoint}` : null;
  
  // Añadir parámetros GET si existen
  let finalUrl = url;
  if (url && options?.query) {
    const params = new URLSearchParams();
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      finalUrl = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<Data>(
    finalUrl,
    fetcher,
    options
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
