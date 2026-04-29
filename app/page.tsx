'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/storage';
import OnboardingPage from '@/components/OnboardingPage';
import MainApp from '@/components/MainApp';

export default function Home() {
  const [ready, setReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const user = getUser();
    setHasUser(!!user);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!hasUser) {
    return <OnboardingPage onComplete={() => setHasUser(true)} />;
  }

  return <MainApp />;
}
