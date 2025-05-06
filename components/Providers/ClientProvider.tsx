import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { useUserStore } from '~/store/userStore';

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useUserStore((sorte) => sorte.userInfo);
  const router = useRouter();
  const wsContext = useWebSocketContext();
  useEffect(() => {
    if (userInfo) {
      router.replace('/(tabs)/be');
      wsContext.connect(userInfo.globalUserId);
    } else {
      router.replace('/(auth)/login');
    }
  }, [userInfo]);
  return <>{children}</>;
};
