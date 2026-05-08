import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import theme from '../constants/theme';

export default function Index() {
  return (
    <LinearGradient
      colors={[theme.colors.background, '#0B1E2F', theme.colors.background]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Offline-first mobile</Text>
          </View>

          <Text style={styles.title}>RoadTo26</Text>
          <Text style={styles.subtitle}>
            Meu album da Copa, meus amigos, minha corrida ate completar tudo.
          </Text>

          <View style={styles.panel}>
            <Text style={styles.panelLabel}>Base inicial</Text>
            <Text style={styles.panelTitle}>Colecao social de figurinhas</Text>
            <Text style={styles.panelText}>
              Tema dark-first, pronto para evoluir com album, scanner e ranking.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.cardSoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: theme.spacing.md,
    maxWidth: 360,
  },
  panel: {
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  panelLabel: {
    color: theme.colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: theme.spacing.sm,
  },
  panelText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
});
