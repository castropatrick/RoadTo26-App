import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import StickerCell from '../../components/StickerCell';
import {
  addStickerDuplicate,
  getTeamStickers,
  markStickerCollected,
  removeStickerDuplicate,
  unmarkSticker,
} from '../../db/queries';
import { useTheme } from '../../hooks/useTheme';

export default function TeamAlbumScreen() {
  const router = useRouter();
  const { teamCode } = useLocalSearchParams();
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [stickers, setStickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionStickerId, setActionStickerId] = useState(null);
  const [error, setError] = useState(null);

  async function loadStickers({ showLoading = true } = {}) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const rows = await getTeamStickers(String(teamCode ?? '').toUpperCase());

      setStickers(rows);
    } catch (loadError) {
      setError(loadError);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadStickers();
  }, [teamCode]);

  async function runStickerAction(stickerId, action) {
    setActionStickerId(stickerId);
    setError(null);

    try {
      await action(stickerId);
      await loadStickers({ showLoading: false });
    } catch (actionError) {
      setError(actionError);
    } finally {
      setActionStickerId(null);
    }
  }

  const summary = useMemo(() => {
    const total = stickers.length;
    const collected = stickers.filter(
      (sticker) => sticker.status === 'collected' || sticker.status === 'duplicate'
    ).length;
    const duplicates = stickers.reduce(
      (sum, sticker) => sum + Number(sticker.duplicate_count ?? 0),
      0
    );
    const firstSticker = stickers[0];

    return {
      total,
      collected,
      duplicates,
      percent: total > 0 ? Math.round((collected / total) * 100) : 0,
      teamName: firstSticker?.team_name,
      teamCode: firstSticker?.team_code ?? String(teamCode ?? '').toUpperCase(),
      groupCode: firstSticker?.group_code,
    };
  }, [stickers, teamCode]);

  function renderContent() {
    if (isLoading) {
      return (
        <StateBlock>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Carregando figurinhas
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            Buscando os 20 slots da selecao no SQLite.
          </Text>
        </StateBlock>
      );
    }

    if (error || stickers.length === 0) {
      return (
        <StateBlock>
          <Text style={[styles.stateTitle, { color: colors.red }]}>
            Selecao nao encontrada
          </Text>
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            {error?.message ?? 'Verifique o codigo da selecao ou volte para o album.'}
          </Text>
        </StateBlock>
      );
    }

    return (
      <View style={[styles.grid, { gap: spacing.md }]}>
        {stickers.map((sticker) => (
          <StickerCell
            key={sticker.id}
            isActionLoading={actionStickerId === sticker.id}
            onAddDuplicate={(stickerId) => runStickerAction(stickerId, addStickerDuplicate)}
            onMarkCollected={(stickerId) => runStickerAction(stickerId, markStickerCollected)}
            onRemoveDuplicate={(stickerId) =>
              runStickerAction(stickerId, removeStickerDuplicate)
            }
            onUnmark={(stickerId) => runStickerAction(stickerId, unmarkSticker)}
            sticker={sticker}
          />
        ))}
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
      <Stack.Screen options={{ title: summary.teamCode }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.lg,
            gap: spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.cardSoft,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
        >
          <ArrowLeft color={colors.text} size={20} />
          <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
        </Pressable>

        <View>
          <Text style={[styles.kicker, { color: colors.gold }]}>
            {summary.groupCode ? `Grupo ${summary.groupCode}` : 'Selecao'}
          </Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            {summary.teamName ?? summary.teamCode}
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            {summary.teamCode} - {summary.total || 20} figurinhas
          </Text>
        </View>

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
                Progresso da selecao
              </Text>
              <Text style={[styles.progressValue, { color: colors.text }]}>
                {summary.collected} / {summary.total || 20}
              </Text>
            </View>
            <Text style={[styles.percent, { color: colors.gold }]}>
              {summary.percent}%
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
                  backgroundColor: summary.percent > 0 ? colors.green : colors.gray,
                  borderRadius: radius.pill,
                  width: `${Math.max(summary.percent, 2)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.duplicateText, { color: colors.textMuted }]}>
            Duplicatas nesta selecao: {summary.duplicates}
          </Text>
        </View>

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
    paddingTop: 64,
    paddingBottom: 32,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '900',
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
  duplicateText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stateBlock: {
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 220,
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
