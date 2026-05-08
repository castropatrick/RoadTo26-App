import * as SQLite from 'expo-sqlite';

import { STICKERS } from './stickers-seed';

const DATABASE_NAME = 'roadto26.db';

let dbInstance = null;

export async function openDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return dbInstance;
}

export async function getDb() {
  return openDatabase();
}

export async function initializeSchema() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS stickers (
      id TEXT PRIMARY KEY NOT NULL,
      team_code TEXT,
      team_name TEXT,
      group_code TEXT,
      number TEXT NOT NULL,
      slot INTEGER,
      name TEXT NOT NULL,
      sticker_type TEXT NOT NULL DEFAULT 'common',
      rarity TEXT NOT NULL DEFAULT 'common',
      is_special_foil INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS current_user (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT,
      display_name TEXT NOT NULL,
      avatar_seed TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      completed_count INTEGER NOT NULL DEFAULT 0,
      duplicate_count INTEGER NOT NULL DEFAULT 0,
      is_mock INTEGER NOT NULL DEFAULT 1,
      is_synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sticker_status (
      user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'missing',
      duplicate_count INTEGER NOT NULL DEFAULT 0,
      collected_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_synced INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, sticker_id),
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE CASCADE,
      FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE,
      CHECK (status IN ('missing', 'collected', 'duplicate')),
      CHECK (duplicate_count >= 0),
      CHECK (is_synced IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      friend_user_id TEXT NOT NULL,
      username TEXT,
      display_name TEXT NOT NULL,
      avatar_seed TEXT,
      status TEXT NOT NULL DEFAULT 'accepted',
      progress_count INTEGER NOT NULL DEFAULT 0,
      duplicate_count INTEGER NOT NULL DEFAULT 0,
      last_seen_at TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE CASCADE,
      UNIQUE (user_id, friend_user_id),
      CHECK (status IN ('pending', 'requested', 'accepted', 'blocked'))
    );

    CREATE TABLE IF NOT EXISTS friend_albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      friend_user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'missing',
      duplicate_count INTEGER NOT NULL DEFAULT 0,
      collected_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE CASCADE,
      FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE,
      UNIQUE (user_id, friend_user_id, sticker_id),
      CHECK (status IN ('missing', 'collected', 'duplicate')),
      CHECK (duplicate_count >= 0)
    );

    CREATE TABLE IF NOT EXISTS scan_history (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      image_uri TEXT,
      raw_text TEXT,
      detected_sticker_id TEXT,
      confidence REAL,
      scan_mode TEXT NOT NULL DEFAULT 'camera',
      result_status TEXT NOT NULL DEFAULT 'pending',
      candidates_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_synced INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE CASCADE,
      FOREIGN KEY (detected_sticker_id) REFERENCES stickers(id) ON DELETE SET NULL,
      CHECK (scan_mode IN ('camera', 'manual', 'correction')),
      CHECK (result_status IN ('pending', 'confirmed', 'corrected', 'failed')),
      CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      CHECK (is_synced IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS _settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT,
      value_type TEXT NOT NULL DEFAULT 'string',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS _sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload_json TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      available_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE SET NULL,
      CHECK (operation IN ('create', 'update', 'delete', 'upsert')),
      CHECK (status IN ('pending', 'processing', 'failed', 'synced')),
      CHECK (attempts >= 0)
    );

    CREATE TABLE IF NOT EXISTS _search_cache (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      scope TEXT NOT NULL DEFAULT 'local',
      query TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      FOREIGN KEY (user_id) REFERENCES current_user(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_stickers_team_code
      ON stickers (team_code);
    CREATE INDEX IF NOT EXISTS idx_stickers_group_code
      ON stickers (group_code);
    CREATE INDEX IF NOT EXISTS idx_stickers_type
      ON stickers (sticker_type);
    CREATE INDEX IF NOT EXISTS idx_stickers_sort
      ON stickers (group_code, team_code, sort_order);

    CREATE INDEX IF NOT EXISTS idx_sticker_status_sticker_id
      ON sticker_status (sticker_id);
    CREATE INDEX IF NOT EXISTS idx_sticker_status_user_id
      ON sticker_status (user_id);
    CREATE INDEX IF NOT EXISTS idx_sticker_status_status
      ON sticker_status (status);
    CREATE INDEX IF NOT EXISTS idx_sticker_status_updated_at
      ON sticker_status (updated_at);
    CREATE INDEX IF NOT EXISTS idx_sticker_status_collected_at
      ON sticker_status (collected_at);

    CREATE INDEX IF NOT EXISTS idx_current_user_updated_at
      ON current_user (updated_at);

    CREATE INDEX IF NOT EXISTS idx_friends_user_id
      ON friends (user_id);
    CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id
      ON friends (friend_user_id);
    CREATE INDEX IF NOT EXISTS idx_friends_status
      ON friends (status);
    CREATE INDEX IF NOT EXISTS idx_friends_updated_at
      ON friends (updated_at);

    CREATE INDEX IF NOT EXISTS idx_friend_albums_user_id
      ON friend_albums (user_id);
    CREATE INDEX IF NOT EXISTS idx_friend_albums_friend_user_id
      ON friend_albums (friend_user_id);
    CREATE INDEX IF NOT EXISTS idx_friend_albums_sticker_id
      ON friend_albums (sticker_id);
    CREATE INDEX IF NOT EXISTS idx_friend_albums_status
      ON friend_albums (status);
    CREATE INDEX IF NOT EXISTS idx_friend_albums_updated_at
      ON friend_albums (updated_at);

    CREATE INDEX IF NOT EXISTS idx_scan_history_user_id
      ON scan_history (user_id);
    CREATE INDEX IF NOT EXISTS idx_scan_history_detected_sticker_id
      ON scan_history (detected_sticker_id);
    CREATE INDEX IF NOT EXISTS idx_scan_history_scan_mode
      ON scan_history (scan_mode);
    CREATE INDEX IF NOT EXISTS idx_scan_history_result_status
      ON scan_history (result_status);
    CREATE INDEX IF NOT EXISTS idx_scan_history_created_at
      ON scan_history (created_at);

    CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id
      ON _sync_queue (user_id);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_id
      ON _sync_queue (entity_id);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_status
      ON _sync_queue (status);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_available_at
      ON _sync_queue (available_at);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at
      ON _sync_queue (created_at);

    CREATE INDEX IF NOT EXISTS idx_search_cache_user_id
      ON _search_cache (user_id);
    CREATE INDEX IF NOT EXISTS idx_search_cache_scope_query
      ON _search_cache (scope, query);
    CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at
      ON _search_cache (expires_at);

    INSERT OR IGNORE INTO _settings (key, value, value_type)
    VALUES ('schema_version', '1', 'number');
  `);

  return db;
}

function mapSeedStickerToRow(sticker) {
  const stickerType = sticker.type ?? sticker.sticker_type ?? 'COMMON';
  const isSpecialFoil =
    sticker.isSpecialFoil ?? sticker.is_special_foil ?? stickerType === 'SPECIAL_FOIL';

  return {
    id: sticker.id,
    team_code: sticker.teamCode ?? sticker.team_code ?? null,
    team_name: sticker.teamName ?? sticker.team_name ?? null,
    group_code: sticker.group ?? sticker.group_code ?? null,
    number: sticker.number,
    slot: sticker.slot ?? null,
    name: sticker.playerName ?? sticker.name,
    sticker_type: stickerType,
    rarity: sticker.rarity ?? stickerType,
    is_special_foil: isSpecialFoil ? 1 : 0,
    sort_order: sticker.sortOrder ?? sticker.sort_order ?? Number(sticker.slot ?? 0),
  };
}

export async function seedStickersIfNeeded() {
  const db = await getDb();
  const existing = await db.getFirstAsync('SELECT COUNT(*) AS count FROM stickers');

  if ((existing?.count ?? 0) > 0) {
    return {
      inserted: 0,
      skipped: true,
      total: existing.count,
    };
  }

  await db.withTransactionAsync(async () => {
    const statement = await db.prepareAsync(`
      INSERT INTO stickers (
        id,
        team_code,
        team_name,
        group_code,
        number,
        slot,
        name,
        sticker_type,
        rarity,
        is_special_foil,
        sort_order
      )
      VALUES (
        $id,
        $team_code,
        $team_name,
        $group_code,
        $number,
        $slot,
        $name,
        $sticker_type,
        $rarity,
        $is_special_foil,
        $sort_order
      )
    `);

    try {
      for (const sticker of STICKERS) {
        await statement.executeAsync(mapSeedStickerToRow(sticker));
      }
    } finally {
      await statement.finalizeAsync();
    }
  });

  return {
    inserted: STICKERS.length,
    skipped: false,
    total: STICKERS.length,
  };
}

export default {
  openDatabase,
  getDb,
  initializeSchema,
  seedStickersIfNeeded,
};
