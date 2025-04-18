import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(have)/[...all]" />
      <Stack.Screen name="(who)/[...all]" />
      <Stack.Screen name="(do)/[...all]" />
    </Stack>
  );
}
