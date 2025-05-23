import liff from '@line/liff';
import { useCallback, useEffect, useState } from 'react';

type LiffProfile = Awaited<ReturnType<typeof liff.getProfile>>;

export function useLiff(liffId: string) {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(() => {
    liff.login();
  }, []);

  const logout = useCallback(() => {
    liff.logout();
    window.location.reload();
  }, []);

  useEffect(() => {
    liff
      .init({ liffId })
      .then(() => {
        if (!liff.isLoggedIn()) {
          login();
          return;
        }
        setIsReady(true);
        return liff.getProfile();
      })
      .then((profile) => {
        if (profile) setProfile(profile);
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }, [liffId, login]);

  return { liff, isReady, profile, error, login, logout };
}
