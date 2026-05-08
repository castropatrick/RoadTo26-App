import { getDb } from './schema';

export async function getTeamSummaries() {
  const db = await getDb();

  return db.getAllAsync(`
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
    WHERE stickers.team_code NOT IN ('FWC', 'CC')
      AND stickers.team_code IS NOT NULL
    GROUP BY stickers.team_code, stickers.team_name, stickers.group_code
    ORDER BY stickers.group_code ASC, stickers.team_name ASC
  `);
}

export async function getTeamStickers(teamCode) {
  const db = await getDb();

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
      WHERE stickers.team_code = ?
      ORDER BY stickers.slot ASC, stickers.sort_order ASC
    `,
    teamCode
  );
}
