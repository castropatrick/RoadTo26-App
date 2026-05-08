import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getCollectionStats } from '../db/queries';
import { useTheme } from '../hooks/useTheme';

function StatCard({ label, value, tone }) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function TeamRow({ team }) {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.teamRow}>
      <View style={styles.teamInfo}>
        <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
          {team.teamName}
        </Text>
        <Text style={[styles.teamMeta, { color: colors.textMuted }]}>
          {team.teamCode} - Grupo {team.groupCode}
        </Text>
      </View>
      <View style={styles.teamProgress}>
        <Text style={[styles.teamPercent, { color: colors.gold }]}>{team.percent}%</Text>
        <View
          style={[
            styles.teamTrack,
            {
              backgroundColor: colors.backgroundElevated,
              borderRadius: radius.pill,
            },
          ]}
        >
          <View
            style={[
              styles.teamFill,
              {
                backgroundColor: team.percent > 0 ? colors.green : colors.gray,
                borderRadius: radius.pill,
                width: `${Math.max(team.percent, 2)}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCollectionStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  function renderState() {
    if (isLoading) {
      return (
        <StateCard>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Calculando estatisticas
          </Text>
        </StateCard>
      );
    }

    if (error) {
      return (
        <StateCard>
          <Text style={[styles.stateTitle, { color: colors.red }]}>
            Nao foi possivel carregar stats
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            {error.message}
          </Text>
        </StateCard>
      );
    }

    if (!stats || stats.totalStickers === 0) {
      return (
        <StateCard>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Estatisticas indisponiveis
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            O album local ainda nao tem stickers carregados.
          </Text>
        </StateCard>
      );
    }

    return null;
  }

  function StateCard({ children }) {
    return (
      <View
        style={[
          styles.stateCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        {children}
      </View>
    );
  }

  const state = renderState();

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
        <View>
          <Text style={[styles.kicker, { color: colors.gold }]}>Stats</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Minha colecao
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Visao geral do progresso local no RoadTo26.
          </Text>
        </View>

        {state}

        {stats ? (
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
                    Progresso geral
                  </Text>
                  <Text style={[styles.progressValue, { color: colors.text }]}>
                    {stats.collectedCount} / {stats.totalStickers}
                  </Text>
                </View>
                <Text style={[styles.percent, { color: colors.gold }]}>
                  {stats.overallPercent}%
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
                      width: `${Math.max(stats.overallPercent, 2)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressHint, { color: colors.textMuted }]}>
                {stats.completedTeams} selecoes completas
              </Text>
            </View>

            <View style={[styles.statsGrid, { gap: spacing.md }]}>
              <StatCard label="Coletadas" tone={colors.green} value={stats.collectedCount} />
              <StatCard label="Faltantes" tone={colors.red} value={stats.missingCount} />
              <StatCard label="Duplicatas" tone={colors.gold} value={stats.duplicateCount} />
              <StatCard
                label="Special foils"
                tone={colors.blue}
                value={stats.specialFoilCollected}
              />
            </View>

            <Section title="Quase completas" teams={stats.topTeams} />
            <Section title="Menor progresso" teams={stats.lowTeams} />
          </>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

function Section({ title, teams }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={{ marginTop: spacing.md, gap: spacing.md }}>
        {teams.map((team) => (
          <TeamRow key={`${title}-${team.teamCode}`} team={team} />
        ))}
      </View>
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
  stateCard: {
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 180,
    justifyContent: 'center',
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
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
  },
  progressHint: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    borderWidth: 1,
    minHeight: 112,
    width: '47.8%',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  section: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  teamRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '900',
  },
  teamMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  teamProgress: {
    alignItems: 'flex-end',
    width: 96,
  },
  teamPercent: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },
  teamTrack: {
    height: 7,
    overflow: 'hidden',
    width: '100%',
  },
  teamFill: {
    height: '100%',
  },
});
