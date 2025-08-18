"use client";

import { useCallback, useEffect, useState } from 'react';

export default function useTheme() {
  const [isDark, setIsDark] = useState(false);

  // Sync from cookie on mount
  useEffect(() => {
    try {
      const cookie = document.cookie.split('; ').find((row) => row.startsWith('theme='));
      const value = cookie?.split('=')[1];
      const dark = value === 'dark';
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; expires=${expires.toUTCString()}`;
      document.documentElement.classList.toggle('dark', next);
      // Refresh the page after theme toggle
      window.location.reload();
      return next;
    });
  }, []);

  return { isDark, toggle };
}


