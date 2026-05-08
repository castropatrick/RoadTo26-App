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
