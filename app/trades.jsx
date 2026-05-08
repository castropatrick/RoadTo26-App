import { LinearGradient } from 'expo-linear-gradient';
import { Handshake, Repeat2, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export default function TradesPlaceholderScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();

  return (
    <LinearGradient
      colors={[colors.background, '#10221B', colors.background]}
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
          <Text style={[styles.kicker, { color: colors.green }]}>Trocas fisicas</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Matches
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            A tela vai comparar suas faltantes com duplicatas de outros colecionadores
            para sugerir conversas e encontros presenciais.
          </Text>
        </View>

        <View
          style={[
            styles.mainCard,
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
            <Repeat2 color={colors.green} size={34} />
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Comparacao inteligente em breve
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            O RoadTo26 vai destacar quem tem figurinhas que faltam para voce e quais
            repetidas suas podem ajudar outro colecionador.
          </Text>
        </View>

        <View style={[styles.grid, { gap: spacing.md }]}>
          <InfoCard
            icon={Handshake}
            title="Contato entre pessoas"
            text="Matches servem para dar visibilidade e iniciar combinacoes fora do fluxo transacional."
            tone={colors.blue}
          />
          <InfoCard
            icon={ShieldCheck}
            title="Sempre fisico"
            text="Nada de marketplace, pagamento, escrow, carrinho ou entrega intermediada pelo app."
            tone={colors.gold}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function InfoCard({ icon: Icon, title, text, tone }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Icon color={tone} size={24} />
      <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.infoText, { color: colors.textMuted }]}>{text}</Text>
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
  mainCard: {
    borderWidth: 1,
  },
  iconShell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoCard: {
    borderWidth: 1,
    minHeight: 164,
    width: '47.8%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 14,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
});
