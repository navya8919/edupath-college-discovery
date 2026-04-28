import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/colleges - list with search, filter, pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const {
    search = '',
    state = '',
    type = '',
    fees_min = '0',
    fees_max = '10000000',
    course = '',
    sort = 'ranking',
    order = 'asc',
    page = '1',
    limit = '12',
  } = req.query as Record<string, string>;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const filterParams: (string | number)[] = [];
  const conditions: string[] = [];

  if (search) {
    const like = `%${search.toLowerCase()}%`;
    filterParams.push(like, like, like, like);
    conditions.push(`(LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ? OR LOWER(description) LIKE ?)`);
  }
  if (state) {
    filterParams.push(state);
    conditions.push(`state = ?`);
  }
  if (type) {
    filterParams.push(type);
    conditions.push(`type = ?`);
  }
  filterParams.push(parseInt(fees_min));
  conditions.push(`fees_min >= ?`);
  filterParams.push(parseInt(fees_max));
  conditions.push(`fees_max <= ?`);

  if (course) {
    filterParams.push(`%${course}%`);
    conditions.push(`courses LIKE ?`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSort: Record<string, string> = {
    ranking: 'ranking',
    rating: 'rating',
    fees_min: 'fees_min',
    fees_max: 'fees_max',
    name: 'name',
    placement_percentage: 'placement_percentage',
  };
  const sortCol = allowedSort[sort] ?? 'ranking';
  const sortDir = order === 'desc' ? 'DESC' : 'ASC';
  // SQLite doesn't support NULLS LAST — use CASE WHEN instead
  const orderClause = `CASE WHEN ${sortCol} IS NULL THEN 1 ELSE 0 END, ${sortCol} ${sortDir}`;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) AS count FROM colleges ${whereClause}`,
      filterParams
    );
    const total = parseInt(countResult.rows[0].count);

    const pageParams = [...filterParams, parseInt(limit), offset];

    const result = await pool.query(
      `SELECT id, name, location, state, city, fees_min, fees_max, rating, rating_count,
              type, established, image_url, accreditation, ranking, placement_percentage,
              avg_package, total_students, courses, description
       FROM colleges
       ${whereClause}
       ORDER BY ${orderClause}
       LIMIT ? OFFSET ?`,
      pageParams
    );

    res.json({
      colleges: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// GET /api/colleges/states - distinct states for filter
router.get('/states', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT DISTINCT state FROM colleges ORDER BY state');
    res.json({ states: result.rows.map((r) => r.state) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// GET /api/colleges/compare - compare multiple colleges
router.get('/compare', async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.query as { ids?: string };
  if (!ids) {
    res.status(400).json({ error: 'ids query param required' });
    return;
  }
  const idList = ids.split(',').slice(0, 3);
  if (idList.length < 2) {
    res.status(400).json({ error: 'Provide at least 2 college ids' });
    return;
  }
  try {
    const placeholders = idList.map(() => '?').join(',');
    const result = await pool.query(
      `SELECT * FROM colleges WHERE id IN (${placeholders})`,
      idList
    );
    res.json({ colleges: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compare colleges' });
  }
});

// GET /api/colleges/:id - detail
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM colleges WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'College not found' });
      return;
    }
    res.json({ college: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
});

// POST /api/colleges/:id/save - save college (auth required)
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      'INSERT INTO saved_colleges (id, user_id, college_id) VALUES (gen_random_uuid(),$1,$2) ON CONFLICT (user_id, college_id) DO NOTHING',
      [req.user!.id, req.params.id]
    );
    res.json({ saved: true });
  } catch {
    res.status(500).json({ error: 'Failed to save college' });
  }
});

// DELETE /api/colleges/:id/save - unsave college (auth required)
router.delete('/:id/save', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      'DELETE FROM saved_colleges WHERE user_id=$1 AND college_id=$2',
      [req.user!.id, req.params.id]
    );
    res.json({ saved: false });
  } catch {
    res.status(500).json({ error: 'Failed to unsave college' });
  }
});

export default router;
