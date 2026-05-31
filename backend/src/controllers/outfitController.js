import { randomUUID } from "crypto";
import { pool, query } from "../config/db.js";
import { toPublicImageUrl } from "../config/s3.js";

function mapOutfitWithClothes(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    clothes_ids: row.clothes_ids,
    visibility: row.visibility,
    created_at: row.created_at,
    creator_name: row.creator_name,
    creator_avatar: row.creator_avatar,
    save_count: row.save_count,
    saved_at: row.saved_at,
    clothes: Array.isArray(row.clothes)
      ? row.clothes.map((cloth) => ({
          ...cloth,
          image_url: toPublicImageUrl(cloth.image_url),
        }))
      : [],
  };
}

export async function getOutfits(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'image_url', c.image_url,
                    'category', c.category,
                    'description', c.description,
                    'visibility', c.visibility,
                    'created_at', c.created_at
                  )
                  ORDER BY oc.position
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
              ) as clothes
       FROM outfits o
       LEFT JOIN LATERAL unnest(o.clothes_ids) WITH ORDINALITY AS oc(cloth_id, position) ON true
       LEFT JOIN clothes c ON c.id = oc.cloth_id
       WHERE o.user_id = $1
       GROUP BY o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      ok: true,
      outfits: result.rows.map(mapOutfitWithClothes),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfits load failed", details: error.message });
  }
}

export async function createOutfit(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const { name, clothesIds } = req.body || {};
    if (!name || !Array.isArray(clothesIds) || clothesIds.length === 0) {
      return res.status(400).json({ ok: false, message: "name and clothesIds are required" });
    }

    const result = await query(
      `INSERT INTO outfits (user_id, name, clothes_ids, visibility)
       VALUES ($1, $2, $3, 'private')
       RETURNING id, user_id, name, clothes_ids, visibility, created_at`,
      [req.user.id, name.trim(), clothesIds]
    );

    return res.status(201).json({ ok: true, outfit: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfit save failed", details: error.message });
  }
}

export async function deleteOutfit(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    await query("DELETE FROM outfits WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfit delete failed", details: error.message });
  }
}

export async function toggleOutfitVisibility(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const { visibility } = req.body;

    if (!visibility || !["private", "public"].includes(visibility)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid visibility value. Use 'private' or 'public'",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE outfits
         SET visibility = $2, updated_at = NOW()
         WHERE id = $1 AND user_id = $3
         RETURNING id, user_id, name, clothes_ids, visibility, created_at`,
        [req.params.id, visibility, req.user.id]
      );

      if (!result.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ ok: false, message: "Outfit not found" });
      }

      // If outfit is made public, also set all included clothes to public
      if (visibility === "public") {
        const outfit = result.rows[0];
        if (Array.isArray(outfit.clothes_ids) && outfit.clothes_ids.length) {
          await client.query(
            `UPDATE clothes
             SET visibility = 'public', updated_at = NOW()
             WHERE id = ANY($1::uuid[])`,
            [outfit.clothes_ids]
          );
        }
      }

      await client.query("COMMIT");
      return res.json({ ok: true, outfit: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to update outfit visibility" });
  }
}

export async function getDiscoverOutfits(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "recent";

    let orderBy = "o.created_at DESC";
    if (sort === "trending") {
      orderBy = "COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) DESC, o.created_at DESC";
    }

    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) as save_count,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'image_url', c.image_url,
                    'category', c.category,
                    'description', c.description,
                    'visibility', c.visibility,
                    'created_at', c.created_at
                  )
                  ORDER BY oc.position
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
              ) as clothes
       FROM outfits o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN LATERAL unnest(o.clothes_ids) WITH ORDINALITY AS oc(cloth_id, position) ON true
       LEFT JOIN clothes c ON c.id = oc.cloth_id
       WHERE o.visibility = 'public'
       GROUP BY o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at, u.name, u.avatar_url
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM outfits WHERE visibility = 'public'`
    );
    const total = parseInt(countResult.rows[0].total);

    return res.json({
      ok: true,
      outfits: result.rows.map(mapOutfitWithClothes),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load discover feed" });
  }
}

export async function getDiscoverClothes(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "recent";

    let orderBy = "c.created_at DESC";
    if (sort === "trending") {
      orderBy = "c.created_at DESC";
    }

    const result = await query(
      `SELECT c.id, c.user_id, c.image_url, c.category, c.description, c.created_at,
              c.visibility,
              u.name as creator_name, u.avatar_url as creator_avatar
       FROM clothes c
       JOIN users u ON u.id = c.user_id
       WHERE c.visibility = 'public'
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM clothes WHERE visibility = 'public'`
    );
    const total = parseInt(countResult.rows[0].total);

    return res.json({
      ok: true,
      clothes: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load discover clothes" });
  }
}

export async function saveOutfit(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const outfitId = req.params.id || req.body?.outfit_id;

    if (!outfitId) {
      return res.status(400).json({ ok: false, message: "outfit_id is required" });
    }

    const outfitCheck = await query(
      `SELECT id FROM outfits WHERE id = $1 AND visibility = 'public'`,
      [outfitId]
    );

    if (!outfitCheck.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found or not public" });
    }

    const result = await query(
      `INSERT INTO saved_outfits (id, user_id, outfit_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, outfit_id) DO NOTHING
       RETURNING id, user_id, outfit_id, created_at`,
      [randomUUID(), req.user.id, outfitId]
    );

    return res.status(201).json({
      ok: true,
      saved_outfit: result.rows[0] || { message: "Already saved" },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to save outfit" });
  }
}

export async function getSavedOutfits(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              so.created_at as saved_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'image_url', c.image_url,
                    'category', c.category,
                    'description', c.description,
                    'visibility', c.visibility,
                    'created_at', c.created_at
                  )
                  ORDER BY oc.position
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
              ) as clothes
       FROM saved_outfits so
       JOIN outfits o ON o.id = so.outfit_id
       JOIN users u ON u.id = o.user_id
       LEFT JOIN LATERAL unnest(o.clothes_ids) WITH ORDINALITY AS oc(cloth_id, position) ON true
       LEFT JOIN clothes c ON c.id = oc.cloth_id
       WHERE so.user_id = $1
       GROUP BY o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
                u.name, u.avatar_url, so.created_at
       ORDER BY so.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      ok: true,
      saved_outfits: result.rows.map(mapOutfitWithClothes),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load saved outfits" });
  }
}

export async function getOutfitById(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) as save_count,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'image_url', c.image_url,
                    'category', c.category,
                    'description', c.description,
                    'visibility', c.visibility,
                    'created_at', c.created_at
                  )
                  ORDER BY oc.position
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
              ) as clothes
       FROM outfits o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN LATERAL unnest(o.clothes_ids) WITH ORDINALITY AS oc(cloth_id, position) ON true
       LEFT JOIN clothes c ON c.id = oc.cloth_id
       WHERE o.id = $1
       GROUP BY o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at, u.name, u.avatar_url`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found" });
    }

    const outfit = mapOutfitWithClothes(result.rows[0]);
    const isOwner = outfit.user_id === req.user.id;
    if (outfit.visibility !== "public" && !isOwner) {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }

    return res.json({ ok: true, outfit });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load outfit", details: error.message });
  }
}

export async function getOutfitClothesVisibility(req, res) {
  try {
    const result = await query(
      `SELECT c.id, c.visibility
       FROM outfits o
       LEFT JOIN LATERAL unnest(o.clothes_ids) WITH ORDINALITY AS oc(cloth_id, position) ON true
       LEFT JOIN clothes c ON c.id = oc.cloth_id
       WHERE o.id = $1
       ORDER BY oc.position`,
      [req.params.id]
    );

    return res.json({ ok: true, clothes: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load clothes visibility", details: error.message });
  }
}

export async function removeSavedOutfit(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    await query(
      `DELETE FROM saved_outfits WHERE user_id = $1 AND outfit_id = $2`,
      [req.user.id, req.params.outfitId]
    );

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to delete saved outfit" });
  }
}
