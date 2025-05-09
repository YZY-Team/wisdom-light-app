import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { useAuthStore } from '~/store/authStore';
import { useUserStore } from '~/store/userStore';

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((sorte) => sorte.isLoggedIn);
  const router = useRouter();
  useEffect(() => {
    console.log("isLoggedIn更新",isLoggedIn);
    
    if (isLoggedIn) {
      
      router.replace('/(tabs)/be');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn]);
  return <>{children}</>;
};
