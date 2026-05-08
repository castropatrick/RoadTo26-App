import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Check, Image as ImageIcon, RefreshCcw, Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ScannedStickerCard from '../../components/ScannedStickerCard';
import StickerSearchModal from '../../components/StickerSearchModal';
import {
  addStickerDuplicate,
  createScanHistory,
  getStickerCollectionState,
  markStickerCollected,
} from '../../db/queries';
import { useTheme } from '../../hooks/useTheme';

function isStickerCollected(sticker) {
  return (
    sticker?.status === 'collected' ||
    sticker?.status === 'duplicate' ||
    Number(sticker?.duplicate_count ?? 0) > 0
  );
}

export default function ScannerScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [photoUri, setPhotoUri] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const hasPermission = permission?.granted;
  const isPermissionLoading = !permission;

  async function handleRequestPermission() {
    setError(null);

    try {
      await requestPermission();
    } catch (permissionError) {
      setError(permissionError?.message || 'Nao foi possivel pedir permissao da camera.');
    }
  }

  async function handleTakePhoto() {
    if (!cameraRef.current || isTakingPhoto) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.72,
        skipProcessing: false,
      });

      setPhotoUri(photo?.uri ?? null);
    } catch (photoError) {
      setError(photoError?.message || 'Nao foi possivel capturar a imagem.');
    } finally {
      setIsTakingPhoto(false);
    }
  }

  async function handleSelectSticker(sticker) {
    try {
      setError(null);
      setSuccessMessage(null);
      const state = await getStickerCollectionState(sticker.id);
      setSelectedSticker(state);
    } catch (selectError) {
      setError(selectError?.message || 'Nao foi possivel selecionar a figurinha.');
    }
  }

  async function handleConfirm() {
    if (!selectedSticker) {
      setError('Selecione uma figurinha antes de confirmar.');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsConfirming(true);

      const currentState = await getStickerCollectionState(selectedSticker.id);
      const wasCollected = isStickerCollected(currentState);

      if (wasCollected) {
        await addStickerDuplicate(currentState.id);
      } else {
        await markStickerCollected(currentState.id);
      }

      await createScanHistory({
        imageUri: photoUri,
        detectedStickerId: currentState.id,
        confidence: 1,
        scanMode: 'camera',
        resultStatus: 'confirmed',
      });

      const updatedState = await getStickerCollectionState(currentState.id);
      setSelectedSticker(updatedState);
      setSuccessMessage(
        wasCollected
          ? 'Repetida adicionada as duplicatas.'
          : 'Nova figurinha adicionada ao album.'
      );
    } catch (confirmError) {
      setError(confirmError?.message || 'Nao foi possivel salvar o scan.');
    } finally {
      setIsConfirming(false);
    }
  }

  function handleRetake() {
    setPhotoUri(null);
    setSuccessMessage(null);
    setError(null);
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
            gap: spacing.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <View>
          <Text style={[styles.kicker, { color: colors.gold }]}>Camera V1</Text>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>
            Scanner
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textMuted }]}>
            Capture a figurinha e confirme manualmente qual item do album local deve
            ser salvo. OCR fica para a proxima etapa.
          </Text>
        </View>

        <View
          style={[
            styles.cameraCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={[styles.cameraFrame, { borderRadius: radius.md }]}>
            {isPermissionLoading ? (
              <StateBlock>
                <ActivityIndicator color={colors.gold} />
                <Text style={[styles.stateTitle, { color: colors.text }]}>
                  Verificando camera
                </Text>
              </StateBlock>
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
            ) : hasPermission ? (
              <CameraView ref={cameraRef} facing="back" style={styles.camera} />
            ) : (
              <StateBlock>
                <Camera color={colors.gold} size={34} />
                <Text style={[styles.stateTitle, { color: colors.text }]}>
                  Camera sem permissao
                </Text>
                <Text style={[styles.stateText, { color: colors.textMuted }]}>
                  Voce ainda pode selecionar uma figurinha manualmente.
                </Text>
              </StateBlock>
            )}
          </View>

          <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.sm }]}>
            {hasPermission && !photoUri ? (
              <ActionButton
                disabled={isTakingPhoto}
                icon={Camera}
                label={isTakingPhoto ? 'Capturando...' : 'Tirar foto'}
                onPress={handleTakePhoto}
                primary
              />
            ) : null}

            {photoUri ? (
              <ActionButton icon={RefreshCcw} label="Tirar outra" onPress={handleRetake} />
            ) : null}

            {!hasPermission ? (
              <ActionButton
                icon={Camera}
                label="Permitir camera"
                onPress={handleRequestPermission}
                primary
              />
            ) : null}

            <ActionButton
              icon={Search}
              label="Selecionar figurinha"
              onPress={() => setIsSearchOpen(true)}
            />
          </View>
        </View>

        {selectedSticker ? (
          <>
            <ScannedStickerCard imageUri={photoUri} sticker={selectedSticker} />

            <View
              style={[
                styles.confirmCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                },
              ]}
            >
              <View style={styles.confirmHeader}>
                <ImageIcon color={colors.gold} size={22} />
                <Text style={[styles.confirmTitle, { color: colors.text }]}>
                  Confirmar resultado
                </Text>
              </View>
              <Text style={[styles.confirmText, { color: colors.textMuted }]}>
                Se a figurinha ainda nao estiver coletada, ela sera marcada como
                coletada. Se ja estiver, sera adicionada como repetida.
              </Text>
              <ActionButton
                disabled={isConfirming}
                icon={Check}
                label={isConfirming ? 'Salvando...' : 'Confirmar scan'}
                onPress={handleConfirm}
                primary
              />
            </View>
          </>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhuma figurinha selecionada
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Tire uma foto e use a busca manual para escolher a figurinha correta.
            </Text>
          </View>
        )}

        {successMessage ? (
          <FeedbackCard tone={colors.green} text={successMessage} />
        ) : null}

        {error ? <FeedbackCard tone={colors.red} text={error} /> : null}
      </ScrollView>

      <StickerSearchModal
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSelectSticker}
        visible={isSearchOpen}
      />
    </LinearGradient>
  );
}

function StateBlock({ children }) {
  return <View style={styles.stateBlock}>{children}</View>;
}

function ActionButton({ disabled = false, icon: Icon, label, onPress, primary = false }) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: primary ? colors.gold : colors.cardSoft,
          borderColor: primary ? colors.gold : colors.border,
          borderRadius: radius.pill,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <Icon color={primary ? colors.background : colors.text} size={18} />
      <Text style={[styles.actionText, { color: primary ? colors.background : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FeedbackCard({ text, tone }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.feedback,
        {
          backgroundColor: colors.card,
          borderColor: tone,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[styles.feedbackText, { color: tone }]}>{text}</Text>
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
  cameraCard: {
    borderWidth: 1,
  },
  cameraFrame: {
    aspectRatio: 3 / 4,
    overflow: 'hidden',
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  stateBlock: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  confirmCard: {
    borderWidth: 1,
    gap: 14,
  },
  confirmHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  confirmText: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyCard: {
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  feedback: {
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
});
