import '../global.css';
// import 'expo-dev-client';
import { LogBox } from 'react-native';
// 忽略Reanimated警告
LogBox.ignoreLogs(['[Reanimated]']);

import { Slot, Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from '~/contexts/WebSocketContext';
export { ErrorBoundary } from 'expo-router';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '~/drizzle/migrations';
import { navigationRef } from '~/utils/navigationService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const expoDb = openDatabaseSync('tasks');
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);
  if (error) {
    console.error(error);
  }
  if (success) {
    console.log('Migrations successful');
  }
  useDrizzleStudio(expoDb);
  return (
    <SQLiteProvider databaseName={'tasks'} options={{ enableChangeListener: true }} >
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </WebSocketProvider>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
