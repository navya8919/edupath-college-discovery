import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/user/saved - get saved colleges
router.get('/saved', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.location, c.state, c.city, c.fees_min, c.fees_max,
              c.rating, c.rating_count, c.type, c.image_url, c.ranking, c.placement_percentage,
              sc.created_at as saved_at
       FROM saved_colleges sc
       JOIN colleges c ON c.id = sc.college_id
       WHERE sc.user_id = $1
       ORDER BY sc.created_at DESC`,
      [req.user!.id]
    );
    res.json({ saved: result.rows });
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved colleges' });
  }
});

// GET /api/user/saved-ids - just ids for quick check
router.get('/saved-ids', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT college_id FROM saved_colleges WHERE user_id=$1',
      [req.user!.id]
    );
    res.json({ ids: result.rows.map((r) => r.college_id) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved ids' });
  }
});

// POST /api/user/comparisons - save a comparison
router.post('/comparisons', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { college_ids, name } = req.body;
  if (!college_ids || !Array.isArray(college_ids) || college_ids.length < 2) {
    res.status(400).json({ error: 'Provide at least 2 college_ids' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO saved_comparisons (id, user_id, college_ids, name) VALUES (gen_random_uuid(),$1,$2,$3) RETURNING *',
      [req.user!.id, JSON.stringify(college_ids), name || 'My Comparison']
    );
    res.status(201).json({ comparison: result.rows[0] });
  } catch {
    res.status(500).json({ error: 'Failed to save comparison' });
  }
});

// GET /api/user/comparisons - list saved comparisons
router.get('/comparisons', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM saved_comparisons WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json({ comparisons: result.rows });
  } catch {
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

export default router;
