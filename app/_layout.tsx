import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import {
  Syne_400Regular,
  Syne_700Bold,
} from '@expo-google-fonts/syne';
import {
  DMMono_400Regular,
} from '@expo-google-fonts/dm-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSerifDisplay_400Regular,
    Syne_400Regular,
    Syne_700Bold,
    DMMono_400Regular,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
    </GestureHandlerRootView>
  );
}
