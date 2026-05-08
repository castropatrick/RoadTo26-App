import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Sparkles } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export default function ScannerPlaceholderScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();

  return (
    <LinearGradient
      colors={[colors.background, '#0B1E2F', colors.background]}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: spacing.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <View>
          <Text style={[styles.kicker, { color: colors.gold }]}>Camera V1</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Scanner
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            A camera sera usada para escanear figurinhas soltas, coladas no album e
            paginas completas, sempre com confirmacao antes de salvar.
          </Text>
        </View>

        <View
          style={[
            styles.heroCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
            },
          ]}
        >
          <View
            style={[
              styles.iconShell,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Camera color={colors.gold} size={38} />
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Scanner em construcao
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            O fluxo V1 vai identificar codigo, jogador, selecao ou slot, sugerir a
            figurinha mais provavel e permitir correcao manual.
          </Text>

          <Pressable
            accessibilityRole="button"
            style={[
              styles.cta,
              {
                backgroundColor: colors.gold,
                borderRadius: radius.pill,
                marginTop: spacing.md,
              },
            ]}
          >
            <Sparkles color={colors.background} size={18} />
            <Text style={[styles.ctaText, { color: colors.background }]}>
              Preparar scanner
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.cardSoft,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.text }]}>Planejado para V1</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Captura com camera, sugestao por OCR, confirmacao do usuario, registro no
            historico e card visual 3x4 da figurinha escaneada.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingTop: 72,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
  },
  subtitle: {
    marginTop: 10,
  },
  heroCard: {
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  iconShell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 20,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  cta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoCard: {
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
