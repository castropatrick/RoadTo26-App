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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setError('');
    setIsSubmitting(true);

    try {
      await register({ username, displayName, password });
      router.replace('/(app)/home');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={[colors.background, '#10251F', colors.background]}
      style={styles.screen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={[styles.card, { borderColor: colors.border, borderRadius: radius.lg }]}>
          <Text style={[styles.kicker, { color: colors.green }]}>Conta local</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Comecar a colecao
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Crie um perfil mock para usar o album antes do backend.
          </Text>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setUsername}
              placeholder="Usuario"
              placeholderTextColor={colors.gray}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  color: colors.text,
                },
              ]}
              value={username}
            />
            <TextInput
              onChangeText={setDisplayName}
              placeholder="Nome exibido"
              placeholderTextColor={colors.gray}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  color: colors.text,
                },
              ]}
              value={displayName}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="Senha local"
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
            onPress={handleRegister}
            style={[
              styles.button,
              {
                backgroundColor: colors.green,
                borderRadius: radius.md,
                marginTop: spacing.lg,
                opacity: isSubmitting ? 0.72 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Criar conta</Text>
            )}
          </Pressable>

          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: spacing.md }}>
              <Text style={[styles.link, { color: colors.blue }]}>Ja tenho conta</Text>
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
