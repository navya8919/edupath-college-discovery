import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/questions - list questions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { college_id, page = '1', limit = '10' } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params: unknown[] = [];
  let where = '';
  if (college_id) {
    params.push(college_id);
    where = `WHERE q.college_id = $${params.length}`;
  }
  try {
    const countResult = await pool.query(`SELECT COUNT(*) AS count FROM questions q ${where}`, params);
    const total = parseInt(countResult.rows[0].count);
    params.push(parseInt(limit));
    params.push(offset);
    const result = await pool.query(
      `SELECT q.*, u.name as author_name,
              (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count,
              c.name as college_name
       FROM questions q
       JOIN users u ON u.id = q.user_id
       LEFT JOIN colleges c ON c.id = q.college_id
       ${where}
       ORDER BY q.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ questions: result.rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/questions
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, college_id } = req.body;
  if (!title || !body) { res.status(400).json({ error: 'Title and body are required' }); return; }
  try {
    const result = await pool.query(
      'INSERT INTO questions (id, user_id, college_id, title, body) VALUES (gen_random_uuid(),$1,$2,$3,$4) RETURNING *',
      [req.user!.id, college_id || null, title, body]
    );
    res.status(201).json({ question: result.rows[0] });
  } catch { res.status(500).json({ error: 'Failed to post question' }); }
});

// GET /api/questions/:id - single question with answers
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const qRes = await pool.query(
      `SELECT q.*, u.name as author_name, c.name as college_name
       FROM questions q JOIN users u ON u.id = q.user_id
       LEFT JOIN colleges c ON c.id = q.college_id
       WHERE q.id=$1`, [req.params.id]
    );
    if (qRes.rows.length === 0) { res.status(404).json({ error: 'Question not found' }); return; }
    const aRes = await pool.query(
      `SELECT a.*, u.name as author_name FROM answers a
       JOIN users u ON u.id = a.user_id
       WHERE a.question_id=$1 ORDER BY a.created_at ASC`, [req.params.id]
    );
    res.json({ question: qRes.rows[0], answers: aRes.rows });
  } catch { res.status(500).json({ error: 'Failed to fetch question' }); }
});

// POST /api/questions/:id/answers
router.post('/:id/answers', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { body } = req.body;
  if (!body) { res.status(400).json({ error: 'Body is required' }); return; }
  try {
    const result = await pool.query(
      'INSERT INTO answers (id, question_id, user_id, body) VALUES (gen_random_uuid(),$1,$2,$3) RETURNING *',
      [req.params.id, req.user!.id, body]
    );
    res.status(201).json({ answer: result.rows[0] });
  } catch { res.status(500).json({ error: 'Failed to post answer' }); }
});

export default router;
