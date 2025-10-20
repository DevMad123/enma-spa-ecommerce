import { useEffect, useState } from 'react';
import axiosClient from '@/axios-client';

export default function useMenuCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axiosClient.get('/menu/categories').then((res) => {
      if (cancelled) return;
      setCategories(Array.isArray(res?.data) ? res.data : []);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return { categories, loading };
}

