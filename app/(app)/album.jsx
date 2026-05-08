import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getTeamSummaries } from '../../db/queries';
import { useTheme } from '../../hooks/useTheme';

const ALL_GROUPS = 'Todos';

export default function AlbumScreen() {
  const router = useRouter();
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUPS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTeams() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getTeamSummaries();

        if (isMounted) {
          setTeams(rows);
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

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const groups = useMemo(() => {
    const uniqueGroups = new Set(
      teams.map((team) => team.group_code).filter(Boolean)
    );

    return [ALL_GROUPS, ...Array.from(uniqueGroups).sort()];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const search = query.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesGroup =
        selectedGroup === ALL_GROUPS || team.group_code === selectedGroup;
      const matchesSearch =
        !search ||
        team.team_name?.toLowerCase().includes(search) ||
        team.team_code?.toLowerCase().includes(search);

      return matchesGroup && matchesSearch;
    });
  }, [query, selectedGroup, teams]);

  function renderContent() {
    if (isLoading) {
      return (
        <StateBlock>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Carregando selecoes
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            Lendo os dados locais do album.
          </Text>
        </StateBlock>
      );
    }

    if (error) {
      return (
        <StateBlock>
          <Text style={[styles.stateTitle, { color: colors.red }]}>
            Nao foi possivel carregar o album
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            Tente abrir a tela novamente em instantes.
          </Text>
        </StateBlock>
      );
    }

    if (teams.length === 0) {
      return (
        <StateBlock>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Album ainda vazio
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            A seed local sera exibida aqui depois de carregada no SQLite.
          </Text>
        </StateBlock>
      );
    }

    if (filteredTeams.length === 0) {
      return (
        <StateBlock>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Nenhuma selecao encontrada
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            Ajuste a busca ou escolha outro grupo.
          </Text>
        </StateBlock>
      );
    }

    return (
      <View style={[styles.grid, { gap: spacing.md }]}>
        {filteredTeams.map((team) => {
          const total = Number(team.total_stickers ?? 0);
          const collected = Number(team.collected_count ?? 0);
          const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

          return (
            <Pressable
              key={team.team_code}
              onPress={() => router.push(`/album/${team.team_code}`)}
              style={[
                styles.teamCard,
                shadows.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <View style={styles.teamTop}>
                <View
                  style={[
                    styles.codeBadge,
                    {
                      backgroundColor: colors.cardSoft,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text style={[styles.codeText, { color: colors.gold }]}>
                    {team.team_code}
                  </Text>
                </View>
                <Text style={[styles.groupText, { color: colors.textMuted }]}>
                  Grupo {team.group_code}
                </Text>
              </View>

              <Text style={[styles.teamName, { color: colors.text }]}>
                {team.team_name}
              </Text>
              <Text style={[styles.teamMeta, { color: colors.textMuted }]}>
                {collected} de {total} figurinhas
              </Text>

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
                      backgroundColor: percent > 0 ? colors.green : colors.gray,
                      borderRadius: radius.pill,
                      width: `${Math.max(percent, 2)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.percentText, { color: colors.text }]}>
                {percent}%
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function StateBlock({ children }) {
    return (
      <View
        style={[
          styles.stateBlock,
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
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={[styles.kicker, { color: colors.gold }]}>Album</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Selecoes
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Acompanhe seu progresso por selecao usando os dados locais.
          </Text>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Search color={colors.textMuted} size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Buscar por selecao ou codigo"
            placeholderTextColor={colors.gray}
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.groupList, { gap: spacing.sm }]}
        >
          {groups.map((group) => {
            const isActive = selectedGroup === group;

            return (
              <Pressable
                key={group}
                onPress={() => setSelectedGroup(group)}
                style={[
                  styles.groupChip,
                  {
                    backgroundColor: isActive ? colors.gold : colors.cardSoft,
                    borderColor: isActive ? colors.gold : colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.groupChipText,
                    { color: isActive ? colors.background : colors.text },
                  ]}
                >
                  {group === ALL_GROUPS ? group : `Grupo ${group}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {renderContent()}
      </ScrollView>
    </LinearGradient>
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
  searchBox: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  groupList: {
    paddingRight: 24,
  },
  groupChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  groupChipText: {
    fontSize: 13,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamCard: {
    borderWidth: 1,
    minHeight: 176,
    width: '47.8%',
  },
  teamTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  groupText: {
    fontSize: 12,
    fontWeight: '800',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 18,
  },
  teamMeta: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
  },
  stateBlock: {
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
});
