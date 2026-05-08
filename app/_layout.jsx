import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { initializeSchema, seedStickersIfNeeded } from '../db/schema';
import { ThemeProvider, useTheme } from '../hooks/useTheme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}

function RootStack() {
  const { colors } = useTheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareDatabase() {
      let bootStep = 'initializeSchema';

      try {
        bootStep = 'initializeSchema';
        await initializeSchema();

        bootStep = 'seedStickersIfNeeded';
        await seedStickersIfNeeded();

        if (isMounted) {
          setIsDbReady(true);
        }
      } catch (error) {
        console.error('[RoadTo26 boot] Database initialization failed', {
          step: bootStep,
          message: error?.message,
          stack: error?.stack,
        });

        if (isMounted) {
          setDbError(error);
        }
      }
    }

    prepareDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  if (dbError) {
    return (
      <BootState
        title="Nao foi possivel preparar o album"
        message="Tente abrir o app novamente em instantes."
      />
    );
  }

  if (!isDbReady) {
    return (
      <BootState
        title="Preparando RoadTo26"
        message="Organizando seu album offline."
        isLoading
      />
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </>
  );
}

function BootState({ title, message, isLoading = false }) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={[styles.bootScreen, { backgroundColor: colors.background }]}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <View
        style={[
          styles.bootCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.gold} size="large" />
        ) : (
          <View style={[styles.errorDot, { backgroundColor: colors.red }]} />
        )}
        <Text
          style={[
            styles.bootTitle,
            typography.heading,
            { color: colors.text, marginTop: spacing.md },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.bootMessage,
            typography.body,
            { color: colors.textMuted, marginTop: spacing.sm },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bootCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
  },
  bootTitle: {
    textAlign: 'center',
  },
  bootMessage: {
    textAlign: 'center',
  },
  errorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
