import React from 'react';
import { Redirect } from 'expo-router';
import TodayScreen from '../src/screens/TodayScreen';
import { useTaskStore } from '../src/store/task-store';

// Beim allerersten Start geht es zuerst zur Einrichtung.
export default function Index() {
  const { profile } = useTaskStore();
  if (!profile.onboarded) return <Redirect href="/onboarding" />;
  return <TodayScreen />;
}
