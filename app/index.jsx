import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import theme from '../constants/theme';
import { AuthProvider, useAuth } from '../hooks/useAuth';

export default function Index() {
  return (
    <AuthProvider>
      <IndexGate />
    </AuthProvider>
  );
}

function IndexGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LinearGradient
        colors={[theme.colors.background, '#0B1E2F', theme.colors.background]}
        style={styles.screen}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.gold} size="large" />
            <Text style={styles.loadingText}>Carregando sua corrida...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
    marginTop: theme.spacing.md,
  },
});
