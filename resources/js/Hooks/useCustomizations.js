import { useEffect, useState } from 'react';
import axiosClient from '@/axios-client';

const KEY = 'front_customizations_cache_v2';

export default function useCustomizations() {
  const [customizations, setCustomizations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cachedEtag = null;
    try {
      const cached = localStorage.getItem(KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) {
          setCustomizations(parsed.data);
          cachedEtag = parsed.etag || null;
          setLoading(false);
        }
      }
    } catch {}

    // Stale-while-revalidate: always revalidate with ETag
    axiosClient
      .get('/customizations', {
        headers: cachedEtag ? { 'If-None-Match': cachedEtag } : {},
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      })
      .then((res) => {
        if (res.status === 304) return; // keep cached
        const data = res?.data || null;
        setCustomizations(data);
        try {
          const etag = res.headers?.etag || null;
          localStorage.setItem(KEY, JSON.stringify({ etag, data }));
        } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { customizations, loading };
}
