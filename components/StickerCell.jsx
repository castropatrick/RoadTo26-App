import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

function getStickerKind(sticker) {
  if (sticker.slot === 1) {
    return 'Escudo';
  }

  if (sticker.slot === 13) {
    return 'Foto';
  }

  if (sticker.is_special_foil === 1 || sticker.sticker_type === 'SPECIAL_FOIL') {
    return 'Foil';
  }

  return 'Jogador';
}

function getStatusLabel(sticker) {
  if (sticker.status === 'duplicate' || Number(sticker.duplicate_count) > 0) {
    return `Repetida +${Number(sticker.duplicate_count)}`;
  }

  if (sticker.status === 'collected') {
    return 'Coletada';
  }

  return 'Faltando';
}

export default function StickerCell({
  sticker,
  isActionLoading = false,
  onAddDuplicate,
  onMarkCollected,
  onRemoveDuplicate,
  onUnmark,
}) {
  const { colors, radius, spacing } = useTheme();
  const isFoil = sticker.is_special_foil === 1 || sticker.sticker_type === 'SPECIAL_FOIL';
  const isCollected = sticker.status === 'collected' || sticker.status === 'duplicate';
  const isDuplicate = sticker.status === 'duplicate' || Number(sticker.duplicate_count) > 0;
  const kind = getStickerKind(sticker);
  const statusColor = isDuplicate ? colors.gold : isCollected ? colors.green : colors.gray;

  return (
    <View
      style={[
        styles.cell,
        {
          borderColor: isFoil ? colors.gold : colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          opacity: isCollected ? 1 : 0.74,
          padding: spacing.sm,
        },
      ]}
    >
      <LinearGradient
        colors={
          isFoil
            ? ['rgba(245, 197, 66, 0.28)', 'rgba(79, 140, 255, 0.16)']
            : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
        }
        style={[styles.preview, { borderRadius: radius.md }]}
      >
        <Text style={[styles.number, { color: isFoil ? colors.gold : colors.text }]}>
          {sticker.number}
        </Text>
        <Text style={[styles.kind, { color: colors.textMuted }]}>{kind}</Text>
      </LinearGradient>

      <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>
        {sticker.name}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.code, { color: colors.textMuted }]}>{sticker.id}</Text>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.status, { color: statusColor }]}>{getStatusLabel(sticker)}</Text>

      <View style={styles.actions}>
        {!isCollected ? (
          <ActionButton
            disabled={isActionLoading}
            label="Coletei"
            onPress={() => onMarkCollected?.(sticker.id)}
            tone={colors.green}
          />
        ) : (
          <ActionButton
            disabled={isActionLoading}
            label="Remover"
            onPress={() => onUnmark?.(sticker.id)}
            tone={colors.red}
          />
        )}
        <ActionButton
          disabled={isActionLoading}
          label="Repetida +1"
          onPress={() => onAddDuplicate?.(sticker.id)}
          tone={colors.gold}
        />
        {isDuplicate ? (
          <ActionButton
            disabled={isActionLoading}
            label="-1 repetida"
            onPress={() => onRemoveDuplicate?.(sticker.id)}
            tone={colors.blue}
          />
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({ disabled, label, onPress, tone }) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          borderColor: tone,
          borderRadius: radius.sm,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.actionText, { color: tone || colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    minHeight: 246,
    width: '47.8%',
  },
  preview: {
    alignItems: 'center',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  number: {
    fontSize: 24,
    fontWeight: '900',
  },
  kind: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
    marginTop: 10,
    minHeight: 34,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  code: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  actions: {
    gap: 6,
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
