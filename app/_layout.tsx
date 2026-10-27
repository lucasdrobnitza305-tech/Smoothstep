import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { TaskStoreProvider, useTaskStore } from '../src/store/task-store';
import { colors } from '../src/theme';

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ground }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

// Wartet, bis der gespeicherte Stand geladen ist, damit nichts kurz „flackert“.
function Screens() {
  const { ready } = useTaskStore();
  if (!ready) return <Loading />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="add" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="review" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="week" />
    </Stack>
  );
}

// Der Rahmen um alle Bildschirme: Schrift laden, Speicher bereitstellen, Navigation.
export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  if (!fontsLoaded) return <Loading />;
  return (
    <TaskStoreProvider>
      <StatusBar style="dark" />
      <Screens />
    </TaskStoreProvider>
  );
}
