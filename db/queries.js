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

export async function getCollectionStats() {
  const db = await getDb();
  const userId = await getCurrentUserId();
  const totals = await db.getFirstAsync(
    `
      SELECT
        COUNT(stickers.id) AS total_stickers,
        COALESCE(
          SUM(
            CASE
              WHEN sticker_status.status IN ('collected', 'duplicate') THEN 1
              ELSE 0
            END
          ),
          0
        ) AS collected_count,
        COALESCE(SUM(sticker_status.duplicate_count), 0) AS duplicate_count,
        COALESCE(
          SUM(
            CASE
              WHEN stickers.is_special_foil = 1
                AND sticker_status.status IN ('collected', 'duplicate') THEN 1
              ELSE 0
            END
          ),
          0
        ) AS special_foil_collected
      FROM stickers
      LEFT JOIN sticker_status
        ON sticker_status.sticker_id = stickers.id
        AND sticker_status.user_id = ?
    `,
    userId
  );
  const teams = await getTeamSummaries();
  const teamProgress = teams.map((team) => {
    const total = Number(team.total_stickers ?? 0);
    const collected = Number(team.collected_count ?? 0);

    return {
      teamCode: team.team_code,
      teamName: team.team_name,
      groupCode: team.group_code,
      total,
      collected,
      missing: Math.max(total - collected, 0),
      percent: total > 0 ? Math.round((collected / total) * 100) : 0,
    };
  });
  const totalStickers = Number(totals?.total_stickers ?? 0);
  const collectedCount = Number(totals?.collected_count ?? 0);
  const duplicateCount = Number(totals?.duplicate_count ?? 0);
  const specialFoilCollected = Number(totals?.special_foil_collected ?? 0);

  return {
    totalStickers,
    collectedCount,
    missingCount: Math.max(totalStickers - collectedCount, 0),
    duplicateCount,
    overallPercent:
      totalStickers > 0 ? Math.round((collectedCount / totalStickers) * 100) : 0,
    specialFoilCollected,
    completedTeams: teamProgress.filter((team) => team.total > 0 && team.collected >= team.total)
      .length,
    topTeams: [...teamProgress]
      .sort((a, b) => b.percent - a.percent || b.collected - a.collected)
      .slice(0, 5),
    lowTeams: [...teamProgress]
      .sort((a, b) => a.percent - b.percent || a.collected - b.collected)
      .slice(0, 5),
  };
}

export async function searchStickers(query) {
  const db = await getDb();
  let currentUserId = null;
  const normalizedQuery = query?.trim() ?? '';
  const likeQuery = `%${normalizedQuery}%`;

  try {
    currentUserId = await getCurrentUserId();
  } catch {
    currentUserId = null;
  }

  if (!normalizedQuery) {
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
          sticker_status.collected_at
        FROM stickers
        LEFT JOIN sticker_status
          ON sticker_status.sticker_id = stickers.id
          AND sticker_status.user_id = ?
        ORDER BY stickers.sort_order ASC, stickers.id ASC
        LIMIT 24
      `,
      currentUserId
    );
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
        sticker_status.collected_at
      FROM stickers
      LEFT JOIN sticker_status
        ON sticker_status.sticker_id = stickers.id
        AND sticker_status.user_id = ?
      WHERE stickers.id LIKE ?
        OR stickers.name LIKE ?
        OR stickers.team_name LIKE ?
        OR stickers.team_code LIKE ?
        OR stickers.number LIKE ?
      ORDER BY
        CASE
          WHEN stickers.id = ? THEN 0
          WHEN stickers.id LIKE ? THEN 1
          WHEN stickers.team_code = ? THEN 2
          ELSE 3
        END,
        stickers.sort_order ASC,
        stickers.id ASC
      LIMIT 40
    `,
    currentUserId,
    likeQuery,
    likeQuery,
    likeQuery,
    likeQuery,
    likeQuery,
    normalizedQuery.toUpperCase(),
    `${normalizedQuery.toUpperCase()}%`,
    normalizedQuery.toUpperCase()
  );
}

export async function getStickerCollectionState(stickerId) {
  const db = await getDb();
  const userId = await getCurrentUserId();

  const sticker = await db.getFirstAsync(
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
      WHERE stickers.id = ?
    `,
    userId,
    stickerId
  );

  if (!sticker) {
    throw new Error('Figurinha nao encontrada no album local.');
  }

  return sticker;
}

export async function createScanHistory(entry) {
  const db = await getDb();
  const userId = await getCurrentUserId();
  const id = entry?.id ?? `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  await db.runAsync(
    `
      INSERT INTO scan_history (
        id,
        user_id,
        image_uri,
        raw_text,
        detected_sticker_id,
        confidence,
        scan_mode,
        result_status,
        candidates_json,
        created_at,
        updated_at,
        is_synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    `,
    id,
    userId,
    entry?.imageUri ?? entry?.image_uri ?? null,
    entry?.rawText ?? entry?.raw_text ?? null,
    entry?.detectedStickerId ?? entry?.detected_sticker_id ?? null,
    entry?.confidence ?? null,
    entry?.scanMode ?? entry?.scan_mode ?? 'camera',
    entry?.resultStatus ?? entry?.result_status ?? 'confirmed',
    entry?.candidatesJson ?? entry?.candidates_json ?? null
  );

  return id;
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
