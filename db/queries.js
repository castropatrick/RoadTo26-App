import { getDb } from './schema';

export async function getCurrentUserId() {
  const db = await getDb();
  const user = await db.getFirstAsync(
    'SELECT id FROM current_user ORDER BY updated_at DESC LIMIT 1'
  );

  if (!user?.id) {
    throw new Error('Nenhum usuario local encontrado. Entre novamente para continuar.');
  }

  return user.id;
}

export async function getTeamSummaries() {
  const db = await getDb();
  let currentUserId = null;

  try {
    currentUserId = await getCurrentUserId();
  } catch {
    currentUserId = null;
  }

  return db.getAllAsync(
    `
      SELECT
        stickers.team_code,
        stickers.team_name,
        stickers.group_code,
        COUNT(stickers.id) AS total_stickers,
        COALESCE(
          SUM(
            CASE
              WHEN sticker_status.status IN ('collected', 'duplicate') THEN 1
              ELSE 0
            END
          ),
          0
        ) AS collected_count
      FROM stickers
      LEFT JOIN sticker_status
        ON sticker_status.sticker_id = stickers.id
        AND sticker_status.user_id = ?
      WHERE stickers.team_code NOT IN ('FWC', 'CC')
        AND stickers.team_code IS NOT NULL
      GROUP BY stickers.team_code, stickers.team_name, stickers.group_code
      ORDER BY stickers.group_code ASC, stickers.team_name ASC
    `,
    currentUserId
  );
}

export async function getTeamStickers(teamCode) {
  const db = await getDb();
  let currentUserId = null;

  try {
    currentUserId = await getCurrentUserId();
  } catch {
    currentUserId = null;
  }

  return db.getAllAsync(
    `
      SELECT
        stickers.id,
        stickers.team_code,
        stickers.team_name,
        stickers.group_code,
        stickers.number,
        stickers.slot,
        stickers.name,
        stickers.sticker_type,
        stickers.rarity,
        stickers.is_special_foil,
        stickers.sort_order,
        COALESCE(sticker_status.status, 'missing') AS status,
        COALESCE(sticker_status.duplicate_count, 0) AS duplicate_count,
        sticker_status.collected_at,
        sticker_status.updated_at AS status_updated_at
      FROM stickers
      LEFT JOIN sticker_status
        ON sticker_status.sticker_id = stickers.id
        AND sticker_status.user_id = ?
      WHERE stickers.team_code = ?
      ORDER BY stickers.slot ASC, stickers.sort_order ASC
    `,
    currentUserId,
    teamCode
  );
}

async function getStickerStatus(db, userId, stickerId) {
  return db.getFirstAsync(
    `
      SELECT status, duplicate_count, collected_at
      FROM sticker_status
      WHERE user_id = ? AND sticker_id = ?
    `,
    userId,
    stickerId
  );
}

export async function updateStickerStatus(stickerId, status) {
  const db = await getDb();
  const userId = await getCurrentUserId();
  const existing = await getStickerStatus(db, userId, stickerId);
  const duplicateCount =
    status === 'missing' ? 0 : Number(existing?.duplicate_count ?? 0);
  const collectedAt =
    status === 'missing'
      ? null
      : existing?.collected_at ?? new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO sticker_status (
        user_id,
        sticker_id,
        status,
        duplicate_count,
        collected_at,
        updated_at,
        is_synced
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
      ON CONFLICT(user_id, sticker_id) DO UPDATE SET
        status = excluded.status,
        duplicate_count = excluded.duplicate_count,
        collected_at = excluded.collected_at,
        updated_at = CURRENT_TIMESTAMP,
        is_synced = 0
    `,
    userId,
    stickerId,
    status,
    duplicateCount,
    collectedAt
  );
}

export async function markStickerCollected(stickerId) {
  return updateStickerStatus(stickerId, 'collected');
}

export async function unmarkSticker(stickerId) {
  return updateStickerStatus(stickerId, 'missing');
}

export async function addStickerDuplicate(stickerId) {
  const db = await getDb();
  const userId = await getCurrentUserId();
  const existing = await getStickerStatus(db, userId, stickerId);
  const duplicateCount = Number(existing?.duplicate_count ?? 0) + 1;
  const collectedAt = existing?.collected_at ?? new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO sticker_status (
        user_id,
        sticker_id,
        status,
        duplicate_count,
        collected_at,
        updated_at,
        is_synced
      )
      VALUES (?, ?, 'duplicate', ?, ?, CURRENT_TIMESTAMP, 0)
      ON CONFLICT(user_id, sticker_id) DO UPDATE SET
        status = 'duplicate',
        duplicate_count = excluded.duplicate_count,
        collected_at = COALESCE(collected_at, excluded.collected_at),
        updated_at = CURRENT_TIMESTAMP,
        is_synced = 0
    `,
    userId,
    stickerId,
    duplicateCount,
    collectedAt
  );
}

export async function removeStickerDuplicate(stickerId) {
  const db = await getDb();
  const userId = await getCurrentUserId();
  const existing = await getStickerStatus(db, userId, stickerId);

  if (!existing) {
    return;
  }

  const nextDuplicateCount = Math.max(Number(existing?.duplicate_count ?? 0) - 1, 0);
  const wasCollected =
    existing.status === 'collected' || existing.status === 'duplicate' || existing.collected_at;
  const nextStatus = nextDuplicateCount > 0 ? 'duplicate' : wasCollected ? 'collected' : 'missing';
  const collectedAt = wasCollected ? existing?.collected_at ?? new Date().toISOString() : null;

  await db.runAsync(
    `
      INSERT INTO sticker_status (
        user_id,
        sticker_id,
        status,
        duplicate_count,
        collected_at,
        updated_at,
        is_synced
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
      ON CONFLICT(user_id, sticker_id) DO UPDATE SET
        status = excluded.status,
        duplicate_count = excluded.duplicate_count,
        collected_at = excluded.collected_at,
        updated_at = CURRENT_TIMESTAMP,
        is_synced = 0
    `,
    userId,
    stickerId,
    nextStatus,
    nextDuplicateCount,
    collectedAt
  );
}
