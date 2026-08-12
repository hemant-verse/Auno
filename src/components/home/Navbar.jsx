'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios'; //[cite: 2, 4]
import ProfileDropdown from '../ProfileDropdown';
import PwaInstallButton from '@/components/PwaInstallButton';

export default function Navbar() {
 
  const pathname = usePathname();
  const [user, setUser] = useState(null); //[cite: 4]
  const [checked, setChecked] = useState(false); //[cite: 4]

  useEffect(() => {
    let isActive = true;

    const identify = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (isActive) setUser(res.data.user);
      } catch {
        if (isActive) setUser(false); // guest
      } finally {
        if (isActive) setChecked(true);
      }
    };

    identify();

    const handleAuthChanged = () => {
      if (!isActive) return;
      identify();
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    return () => {
      isActive = false;
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, [pathname]);

 

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-30"
    >
      <Link href="/">
        <div className="text-5xl font-black tracking-tighter  text-zinc-900 cursor-pointer">
          Z<span className="text-emerald-700">uno</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-3">
        <PwaInstallButton />
        {checked && (
          <>
            {user ? (
              /* ── Logged-in state ── */
              <>
                <ProfileDropdown />
              </>
            ) : (
              /* ── Guest state ── */
              <>
                <Link href="/login">
                  <button className="px-4 py-2 hover:scale-105 text-sm font-semibold text-zinc-800 hover:text-zinc-950 transition-colors cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2.5 text-sm font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-full shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-1 cursor-pointer">
                    Register
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </motion.nav>
  );
}