import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Album, BarChart3, Camera, LogOut, Medal, Repeat2 } from 'lucide-react-native';

import { getCollectionStats } from '../../db/queries';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const shortcuts = [
  {
    label: 'Album',
    description: 'Ver selecoes e progresso',
    icon: Album,
    route: '/(app)/album',
  },
  {
    label: 'Scanner',
    description: 'Adicionar figurinha',
    icon: Camera,
    route: '/scan',
  },
  {
    label: 'Stats',
    description: 'Ver estatisticas',
    icon: BarChart3,
    route: '/stats',
  },
  {
    label: 'Matches',
    description: 'Encontrar trocas',
    icon: Repeat2,
    route: '/trades',
  },
  {
    label: 'Ranking',
    description: 'Comparar progresso',
    icon: Medal,
    route: '/(app)/leaderboard',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, isMockMode } = useAuth();
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const displayName = user?.displayName || user?.username || 'colecionador';
  const progressPercent = stats?.overallPercent ?? 0;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadStats() {
        try {
          setIsLoadingStats(true);
          setStatsError(null);
          const collectionStats = await getCollectionStats();

          if (isMounted) {
            setStats(collectionStats);
          }
        } catch (error) {
          console.error('[Home] Falha ao carregar estatisticas da colecao', {
            message: error?.message,
            stack: error?.stack,
          });

          if (isMounted) {
            setStatsError(error?.message || 'Nao foi possivel carregar sua colecao agora.');
            setStats(null);
          }
        } finally {
          if (isMounted) {
            setIsLoadingStats(false);
          }
        }
      }

      loadStats();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <LinearGradient
      colors={[colors.background, '#0B1E2F', colors.background]}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.lg,
            gap: spacing.lg,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.kicker, { color: colors.gold }]}>RoadTo26</Text>
            <Text style={[styles.title, typography.title, { color: colors.text }]}>
              Ola, {displayName}
            </Text>
            <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
              Seu album local esta pronto para a corrida ate completar tudo.
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Sair"
            onPress={handleLogout}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <LogOut color={colors.text} size={20} />
          </Pressable>
        </View>

        {isMockMode ? (
          <View
            style={[
              styles.mockBadge,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={[styles.mockText, { color: colors.green }]}>
              Modo mock/local ativo
            </Text>
          </View>
        ) : null}

        {isLoadingStats ? (
          <StateCard>
            <ActivityIndicator color={colors.gold} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Carregando sua colecao
            </Text>
            <Text style={[styles.stateText, { color: colors.textMuted }]}>
              Lendo o album local no SQLite.
            </Text>
          </StateCard>
        ) : statsError ? (
          <StateCard>
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Nao foi possivel carregar o progresso
            </Text>
            <Text style={[styles.stateText, { color: colors.textMuted }]}>
              {statsError}
            </Text>
          </StateCard>
        ) : !stats || stats.totalStickers === 0 ? (
          <StateCard>
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Album ainda vazio
            </Text>
            <Text style={[styles.stateText, { color: colors.textMuted }]}>
              Abra o app novamente apos a preparacao local terminar.
            </Text>
          </StateCard>
        ) : (
          <>
            <View
              style={[
                styles.progressCard,
                shadows.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                },
              ]}
            >
              <View style={styles.progressTop}>
                <View>
                  <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
                    Progresso total
                  </Text>
                  <Text style={[styles.progressValue, { color: colors.text }]}>
                    {stats.collectedCount} / {stats.totalStickers}
                  </Text>
                </View>
                <Text style={[styles.percent, { color: colors.gold }]}>
                  {progressPercent}%
                </Text>
              </View>

              <View
                style={[
                  styles.progressTrack,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderRadius: radius.pill,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.gold,
                      borderRadius: radius.pill,
                      width: `${Math.max(progressPercent, progressPercent > 0 ? 4 : 0)}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.progressHint, { color: colors.textMuted, marginTop: spacing.md }]}>
                {stats.completedTeams} selecoes completas no seu album local.
              </Text>
            </View>

            <View style={[styles.metricsGrid, { gap: spacing.md }]}>
              <MetricCard label="Coletadas" value={stats.collectedCount} tone={colors.green} />
              <MetricCard label="Faltantes" value={stats.missingCount} tone={colors.red} />
              <MetricCard label="Duplicatas" value={stats.duplicateCount} tone={colors.blue} />
              <MetricCard label="Brilhantes" value={stats.specialFoilCollected} tone={colors.gold} />
              <MetricCard label="Selecoes completas" value={stats.completedTeams} tone={colors.gold} wide />
            </View>
          </>
        )}

        <View style={[styles.shortcutsGrid, { gap: spacing.md }]}>
          {shortcuts.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route)}
                style={[
                  styles.shortcut,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shortcutIcon,
                    {
                      backgroundColor: colors.cardSoft,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Icon color={colors.gold} size={22} />
                </View>
                <Text style={[styles.shortcutTitle, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.shortcutText, { color: colors.textMuted }]}>
                  {item.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function StateCard({ children }) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.stateCard,
        shadows.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          gap: spacing.sm,
          padding: spacing.lg,
        },
      ]}
    >
      {children}
    </View>
  );
}

function MetricCard({ label, value, tone, wide = false }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.metricCard,
        wide ? styles.metricCardWide : null,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 72,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
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
  iconButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  mockBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mockText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  progressCard: {
    borderWidth: 1,
  },
  progressTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 6,
  },
  percent: {
    fontSize: 24,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    width: '2%',
  },
  progressHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    borderWidth: 1,
    minHeight: 94,
    width: '47.8%',
  },
  metricCardWide: {
    width: '100%',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  stateCard: {
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  shortcut: {
    borderWidth: 1,
    minHeight: 150,
    width: '47.8%',
  },
  shortcutIcon: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  shortcutTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 16,
  },
  shortcutText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
