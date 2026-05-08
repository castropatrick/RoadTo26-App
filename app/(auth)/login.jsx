import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isMockMode } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError('');
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      router.replace('/(app)/home');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={[colors.background, '#0B1E2F', colors.background]}
      style={styles.screen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={[styles.card, { borderColor: colors.border, borderRadius: radius.lg }]}>
          <Text style={[styles.kicker, { color: colors.gold }]}>
            {isMockMode ? 'Modo local' : 'RoadTo26'}
          </Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Entrar no album
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Use qualquer usuario e senha para continuar no mock offline.
          </Text>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setIdentifier}
              placeholder="Usuario ou email"
              placeholderTextColor={colors.gray}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  color: colors.text,
                },
              ]}
              value={identifier}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor={colors.gray}
              secureTextEntry
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  color: colors.text,
                },
              ]}
              value={password}
            />
          </View>

          {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

          <Pressable
            disabled={isSubmitting}
            onPress={handleLogin}
            style={[
              styles.button,
              {
                backgroundColor: colors.gold,
                borderRadius: radius.md,
                marginTop: spacing.lg,
                opacity: isSubmitting ? 0.72 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Entrar</Text>
            )}
          </Pressable>

          <Link href="/(auth)/register" asChild>
            <Pressable style={{ marginTop: spacing.md }}>
              <Text style={[styles.link, { color: colors.blue }]}>Criar conta local</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(17, 31, 51, 0.88)',
    borderWidth: 1,
    padding: 24,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
  },
  subtitle: {
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
  },
  link: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
