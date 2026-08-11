'use client';

import { useEffect, useState } from 'react';

export default function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!promptEvent) return;

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setVisible(false);
      setPromptEvent(null);
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="hidden sm:inline-flex items-center rounded-full border border-emerald-700 bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
    >
      Install App
    </button>
  );
}
