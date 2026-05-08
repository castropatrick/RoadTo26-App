import { Stack } from 'expo-router';

import { AuthProvider } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </AuthProvider>
  );
}
