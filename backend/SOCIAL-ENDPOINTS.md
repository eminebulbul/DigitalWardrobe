// =====================
// YENI API ENDPOINTS - 9. HAFTA SOSYAL FEATURES
// =====================
// Bu dosya, server.js'nin sonuna eklenecek endpoints'leri içerir.

// === 1. KİYAFET VİSİBİLİTY ENDPOINTS ===

// GET /api/clothes - Benim kıyafetlerim (tümü: private+public)
app.get("/api/clothes", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const result = await query(
      `SELECT id, user_id, image_url, category, description, visibility, created_at
       FROM clothes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
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
});

// GET /api/users/:userId/clothes - Başka user'ın public kıyafetleri
app.get("/api/users/:userId/clothes", async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
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
});

// PUT /api/clothes/:id/visibility - Toggle visibility
app.put("/api/clothes/:id/visibility", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const { visibility } = req.body; // 'private' | 'public'
    
    if (!visibility || !['private', 'public'].includes(visibility)) {
      return res.status(400).json({ 
        ok: false, 
        message: "Invalid visibility value. Use 'private' or 'public'" 
      });
    }

    const result = await query(
      `UPDATE clothes
       SET visibility = $2, updated_at = NOW()
       WHERE id = $1 AND user_id = $3
       RETURNING id, user_id, image_url, category, description, visibility, created_at`,
      [req.params.id, visibility, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Clothing not found" });
    }

    return res.json({
      ok: true,
      cloth: {
        ...result.rows[0],
        image_url: toPublicImageUrl(result.rows[0].image_url),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to update visibility" });
  }
});

// === 2. KOMBİN VİSİBİLİTY ENDPOINTS ===

// GET /api/outfits - Benim kombinlerim (tümü: private+public)
app.get("/api/outfits", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const result = await query(
      `SELECT id, user_id, name, clothes_ids, visibility, created_at
       FROM outfits
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ ok: true, outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load outfits" });
  }
});

// GET /api/users/:userId/outfits - Başka user'ın public kombinleri
app.get("/api/users/:userId/outfits", async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const result = await query(
      `SELECT id, user_id, name, clothes_ids, created_at
       FROM outfits
       WHERE user_id = $1 AND visibility = 'public'
       ORDER BY created_at DESC`,
      [req.params.userId]
    );
    return res.json({ ok: true, outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load outfits" });
  }
});

// PUT /api/outfits/:id/visibility - Toggle visibility
app.put("/api/outfits/:id/visibility", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const { visibility } = req.body; // 'private' | 'public'
    
    if (!visibility || !['private', 'public'].includes(visibility)) {
      return res.status(400).json({ 
        ok: false, 
        message: "Invalid visibility value. Use 'private' or 'public'" 
      });
    }

    const result = await query(
      `UPDATE outfits
       SET visibility = $2, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, clothes_ids, visibility, created_at`,
      [req.params.id, visibility, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found" });
    }

    return res.json({ ok: true, outfit: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to update outfit visibility" });
  }
});

// === 3. DISCOVER (KEŞFET) ENDPOINTS ===

// GET /api/discover/outfits - Global public kombinler (paginated)
app.get("/api/discover/outfits", async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'recent'; // 'recent' | 'trending'

    // Base query
    let orderBy = "o.created_at DESC";
    if (sort === 'trending') {
      // Trending = most saved (ileride geliştirilecek)
      orderBy = "COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) DESC, o.created_at DESC";
    }

    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) as save_count
       FROM outfits o
       JOIN users u ON u.id = o.user_id
       WHERE o.visibility = 'public'
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
      outfits: result.rows,
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
});

// === 4. KAYITLI KOMBİNLER ENDPOINTS ===

// POST /api/saved-outfits - Keşfet'ten bir kombinyi kaydet
app.post("/api/saved-outfits", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const { outfit_id } = req.body;
    
    if (!outfit_id) {
      return res.status(400).json({ ok: false, message: "outfit_id is required" });
    }

    // Check if outfit exists and is public
    const outfitCheck = await query(
      `SELECT id FROM outfits WHERE id = $1 AND visibility = 'public'`,
      [outfit_id]
    );
    
    if (!outfitCheck.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found or not public" });
    }

    // Save outfit (UNIQUE constraint prevents duplicates)
    const result = await query(
      `INSERT INTO saved_outfits (id, user_id, outfit_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, outfit_id) DO NOTHING
       RETURNING id, user_id, outfit_id, created_at`,
      [randomUUID(), req.user.id, outfit_id]
    );

    return res.status(201).json({
      ok: true,
      saved_outfit: result.rows[0] || { message: "Already saved" },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to save outfit" });
  }
});

// GET /api/saved-outfits - Benim kayıtlı kombinlerim
app.get("/api/saved-outfits", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              so.created_at as saved_at
       FROM saved_outfits so
       JOIN outfits o ON o.id = so.outfit_id
       JOIN users u ON u.id = o.user_id
       WHERE so.user_id = $1
       ORDER BY so.created_at DESC`,
      [req.user.id]
    );
    return res.json({ ok: true, saved_outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load saved outfits" });
  }
});

// DELETE /api/saved-outfits/:outfitId - Kaydı sil
app.delete("/api/saved-outfits/:outfitId", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    await query(
      `DELETE FROM saved_outfits WHERE user_id = $1 AND outfit_id = $2`,
      [req.user.id, req.params.outfitId]
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to delete saved outfit" });
  }
});

// === 5. PROFIL ENDPOINTS ===

// GET /api/users/:userId/profile - Başka user'ın profili (public view)
app.get("/api/users/:userId/profile", async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
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
});

// GET /api/profile/me - Benim profilim (full data)
app.get("/api/profile/me", requireAuth, async (req, res) => {
  if (!pool) return sendDbUnavailable(res);
  try {
    const profileResult = await query(
      `SELECT id, user_id, display_name, avatar_url, bio, location, created_at, updated_at
       FROM profiles WHERE user_id = $1`,
      [req.user.id]
    );

    return res.json({
      ok: true,
      user: req.user,
      profile: profileResult.rows[0] || null,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Profile load failed" });
  }
});

// =====================
// ÜST KURGUYA EKLENMESI GEREKEN:
// 1. server.js'nin sonundaki existingEndpoints'lerden ÖNCE bu kodları ekle
// 2. Mevcut POST /api/clothes refactor et (visibility default 'private')
// 3. Mevcut POST /api/outfits refactor et (visibility default 'private')
// 4. Migration: schema.sql'ı schema-v2.sql ile replace et
// =====================
