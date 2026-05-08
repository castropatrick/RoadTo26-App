import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../hooks/useTheme';

function getStickerTypeLabel(sticker) {
  if (sticker?.slot === 1) {
    return 'Escudo brilhante';
  }

  if (sticker?.slot === 13) {
    return 'Foto da equipe';
  }

  if (sticker?.is_special_foil === 1 || sticker?.sticker_type === 'SPECIAL_FOIL') {
    return 'Brilhante';
  }

  if (sticker?.team_code === 'FWC') {
    return 'RoadTo26';
  }

  if (sticker?.team_code === 'CC') {
    return 'Extra';
  }

  return 'Jogador';
}

function getPredictedStatus(sticker) {
  const isCollected = sticker?.status === 'collected' || sticker?.status === 'duplicate';
  const hasDuplicate = Number(sticker?.duplicate_count ?? 0) > 0;

  if (isCollected || hasDuplicate) {
    return 'repetida';
  }

  return 'nova';
}

export default function ScannedStickerCard({ imageUri, sticker }) {
  const { colors, spacing, radius, shadows } = useTheme();
  const isBright = sticker?.is_special_foil === 1 || sticker?.sticker_type === 'SPECIAL_FOIL';
  const predictedStatus = getPredictedStatus(sticker);

  if (!sticker) {
    return null;
  }

  return (
    <View
      style={[
        styles.shell,
        shadows.card,
        {
          backgroundColor: colors.card,
          borderColor: isBright ? colors.gold : colors.border,
          borderRadius: radius.xl,
          padding: spacing.sm,
        },
      ]}
    >
      <LinearGradient
        colors={
          isBright
            ? ['rgba(245, 197, 66, 0.30)', 'rgba(79, 140, 255, 0.18)']
            : ['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.03)']
        }
        style={[styles.card, { borderRadius: radius.lg }]}
      >
        <View style={[styles.imageFrame, { borderRadius: radius.md }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: colors.backgroundElevated }]}>
              <Text style={[styles.fallbackCode, { color: colors.gold }]}>{sticker.id}</Text>
              <Text style={[styles.fallbackText, { color: colors.textMuted }]}>
                Selecionada manualmente
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <View style={styles.metaRow}>
            <Text style={[styles.code, { color: colors.gold }]}>{sticker.id}</Text>
            <Text
              style={[
                styles.status,
                {
                  backgroundColor:
                    predictedStatus === 'nova'
                      ? 'rgba(36, 200, 117, 0.14)'
                      : 'rgba(245, 197, 66, 0.14)',
                  color: predictedStatus === 'nova' ? colors.green : colors.gold,
                  borderColor: predictedStatus === 'nova' ? colors.green : colors.gold,
                  borderRadius: radius.pill,
                },
              ]}
            >
              {predictedStatus}
            </Text>
          </View>

          <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>
            {sticker.name}
          </Text>
          <Text numberOfLines={1} style={[styles.team, { color: colors.textMuted }]}>
            {sticker.team_name || sticker.team_code || 'RoadTo26'}
          </Text>
          <Text style={[styles.type, { color: isBright ? colors.gold : colors.textMuted }]}>
            {getStickerTypeLabel(sticker)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    width: '100%',
  },
  card: {
    aspectRatio: 3 / 4,
    overflow: 'hidden',
    padding: 14,
  },
  imageFrame: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  fallbackCode: {
    fontSize: 28,
    fontWeight: '900',
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 13,
    fontWeight: '900',
  },
  status: {
    borderWidth: 1,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 10,
  },
  team: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  type: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textTransform: 'uppercase',
  },
});
