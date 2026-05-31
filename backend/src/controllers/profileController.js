import { query } from "../config/db.js";
import { toPublicImageUrl } from "../config/s3.js";

export async function getMyProfile(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const profile = await query(
      `SELECT id, user_id, display_name, avatar_url, bio, location, created_at, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.json({ ok: true, user: req.user, profile: profile.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Profile load failed", details: error.message });
  }
}

export async function updateMyProfile(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const { displayName, bio, location, avatarUrl } = req.body || {};
    const result = await query(
      `UPDATE profiles
       SET display_name = COALESCE($2, display_name),
           bio = COALESCE($3, bio),
           location = COALESCE($4, location),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING id, user_id, display_name, avatar_url, bio, location, created_at, updated_at`,
      [req.user.id, displayName || null, bio || null, location || null, avatarUrl || null]
    );

    return res.json({ ok: true, profile: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Profile update failed", details: error.message });
  }
}

export async function getOtherUserProfile(req, res) {
  try {
    const userResult = await query(
      `SELECT id, name, avatar_url, bio, created_at FROM users WHERE id = $1`,
      [req.params.userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const profileResult = await query(
      `SELECT display_name, avatar_url, bio, location FROM profiles WHERE user_id = $1`,
      [req.params.userId]
    );

    const user = userResult.rows[0];
    const profile = profileResult.rows[0] || {};

    return res.json({
      ok: true,
      user: {
        ...user,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url || user.avatar_url,
        bio: profile.bio || user.bio,
        location: profile.location,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load profile" });
  }
}

export async function getOtherUserPublicClothes(req, res) {
  try {
    const result = await query(
      `SELECT id, user_id, image_url, category, description, created_at
       FROM clothes
       WHERE user_id = $1 AND visibility = 'public'
       ORDER BY created_at DESC`,
      [req.params.userId]
    );

    return res.json({
      ok: true,
      clothes: result.rows.map((row) => ({
        ...row,
        image_url: toPublicImageUrl(row.image_url),
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load clothes" });
  }
}

export async function getOtherUserPublicOutfits(req, res) {
  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
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
       WHERE o.user_id = $1 AND o.visibility = 'public'
       GROUP BY o.id, o.user_id, o.name, o.clothes_ids, o.visibility, o.created_at, u.name, u.avatar_url
       ORDER BY o.created_at DESC`,
      [req.params.userId]
    );

    return res.json({
      ok: true,
      outfits: result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        clothes_ids: row.clothes_ids,
        visibility: row.visibility,
        created_at: row.created_at,
        creator_name: row.creator_name,
        creator_avatar: row.creator_avatar,
        clothes: Array.isArray(row.clothes)
          ? row.clothes.map((cloth) => ({
              ...cloth,
              image_url: toPublicImageUrl(cloth.image_url),
            }))
          : [],
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load outfits" });
  }
}
