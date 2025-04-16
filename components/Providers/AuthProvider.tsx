import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useIsLogin } from '~/queries/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: isLoggedIn, isLoading } = useIsLogin();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)/be');
    }
  }, [isLoggedIn, segments, isLoading]);

  return <>{children}</>;
}