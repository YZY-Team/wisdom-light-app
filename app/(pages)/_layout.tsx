import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false,
      contentStyle: { backgroundColor: '#F5F8FC' },
     }}>
    </Stack>
  );
}
