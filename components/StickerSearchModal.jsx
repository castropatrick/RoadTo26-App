import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

import { searchStickers } from '../db/queries';
import { useTheme } from '../hooks/useTheme';

export default function StickerSearchModal({ visible, onClose, onSelect }) {
  const { colors, spacing, radius } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    let isMounted = true;

    async function loadResults() {
      try {
        setIsLoading(true);
        setError(null);
        const stickers = await searchStickers(query);

        if (isMounted) {
          setResults(stickers);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || 'Nao foi possivel buscar figurinhas.');
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadResults, 220);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [query, visible]);

  function handleSelect(sticker) {
    onSelect?.(sticker);
    onClose?.();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.kicker, { color: colors.gold }]}>Busca manual</Text>
              <Text style={[styles.title, { color: colors.text }]}>Selecionar figurinha</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar busca"
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.cardSoft,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <X color={colors.text} size={20} />
            </Pressable>
          </View>

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Search color={colors.textMuted} size={20} />
            <TextInput
              autoCapitalize="characters"
              onChangeText={setQuery}
              placeholder="Buscar por codigo, nome ou selecao"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              value={query}
            />
          </View>

          {isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colors.gold} />
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                Buscando no album local...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <Text style={[styles.stateTitle, { color: colors.red }]}>Erro na busca</Text>
              <Text style={[styles.stateText, { color: colors.textMuted }]}>{error}</Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: 18 }}
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.state}>
                  <Text style={[styles.stateTitle, { color: colors.text }]}>
                    Nenhuma figurinha encontrada
                  </Text>
                  <Text style={[styles.stateText, { color: colors.textMuted }]}>
                    Tente codigo, jogador, selecao ou numero.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.resultRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View style={styles.resultMain}>
                    <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.resultMeta, { color: colors.textMuted }]}>
                      {item.id} - {item.team_name || item.team_code}
                    </Text>
                  </View>
                  <Text style={[styles.resultStatus, { color: colors.gold }]}>
                    {item.status === 'duplicate' || item.status === 'collected'
                      ? 'coletada'
                      : 'nova'}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    maxHeight: '86%',
    minHeight: '68%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  searchBox: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    padding: 20,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  resultRow: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  resultMain: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '900',
  },
  resultMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  resultStatus: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
