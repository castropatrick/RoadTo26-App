import { LinearGradient } from 'expo-linear-gradient';
import { Medal, Trophy, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

const mockPodium = [
  {
    name: 'Ana',
    label: 'Complecionista',
    percent: 78,
    tone: 'gold',
  },
  {
    name: 'Bruno',
    label: 'Foils em alta',
    percent: 64,
    tone: 'blue',
  },
  {
    name: 'Carla',
    label: 'Ritmo forte',
    percent: 59,
    tone: 'green',
  },
];

export default function LeaderboardPlaceholderScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();

  return (
    <LinearGradient
      colors={[colors.background, '#101C34', colors.background]}
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
          <Text style={[styles.kicker, { color: colors.blue }]}>Competicao social</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Ranking
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Ranking global e entre amigos vao destacar progresso, selecoes completas,
            quantidade coletada e special foils.
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
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
                Top 3 mock/local
              </Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Podio em construcao
              </Text>
            </View>
            <Trophy color={colors.gold} size={32} />
          </View>

          <View style={[styles.podiumList, { gap: spacing.md, marginTop: spacing.lg }]}>
            {mockPodium.map((item, index) => (
              <PodiumCard key={item.name} item={item} position={index + 1} />
            ))}
          </View>
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
          <Users color={colors.blue} size={24} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Amigos e global em breve
          </Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Estes cards sao apenas placeholder visual. Nenhum backend ou ranking real
            foi conectado nesta sprint.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function PodiumCard({ item, position }) {
  const { colors, radius } = useTheme();
  const tone = colors[item.tone] ?? colors.gold;

  return (
    <View
      style={[
        styles.podiumCard,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View
        style={[
          styles.medal,
          {
            backgroundColor: colors.cardSoft,
            borderColor: tone,
            borderRadius: radius.pill,
          },
        ]}
      >
        <Medal color={tone} size={18} />
        <Text style={[styles.medalText, { color: tone }]}>#{position}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.playerLabel, { color: colors.textMuted }]}>{item.label}</Text>
      </View>
      <Text style={[styles.percent, { color: tone }]}>{item.percent}%</Text>
    </View>
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
    borderWidth: 1,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  podiumList: {
    width: '100%',
  },
  podiumCard: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 82,
    padding: 14,
  },
  medal: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 38,
    justifyContent: 'center',
    width: 66,
  },
  medalText: {
    fontSize: 13,
    fontWeight: '900',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  playerName: {
    fontSize: 17,
    fontWeight: '900',
  },
  playerLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  percent: {
    fontSize: 22,
    fontWeight: '900',
  },
  infoCard: {
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
