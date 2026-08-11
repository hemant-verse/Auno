'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA service worker registered:', registration);
        })
        .catch((error) => {
          console.warn('PWA service worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
