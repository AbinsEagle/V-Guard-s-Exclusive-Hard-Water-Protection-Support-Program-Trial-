import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { InstallationProvider } from '../src/store/installationStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <InstallationProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="install/scan-heater" />
        <Stack.Screen name="install/customer-form" />
        <Stack.Screen name="install/photos" />
        <Stack.Screen name="install/review" />
        <Stack.Screen name="install/success" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </InstallationProvider>
  );
}
