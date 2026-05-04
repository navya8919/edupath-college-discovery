import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

interface CutoffResult {
  maxNirfRank: number;
  preferType?: string;
}

// Category-based rank inflation (simulating easier cutoffs for reserved categories)
function adjustRankForCategory(rank: number, category: string): number {
  switch (category) {
    case 'OBC-NCL': return rank * 0.7; // 30% boost
    case 'SC':      return rank * 0.4; // 60% boost
    case 'ST':      return rank * 0.3; // 70% boost
    case 'EWS':     return rank * 0.8; // 20% boost
    default:        return rank;
  }
}

// Rank-to-NIRF-cutoff mapping per exam
function getCutoff(exam: string, rank: number): CutoffResult | null {
  switch (exam) {
    case 'JEE Advanced':
      if (rank <= 500)   return { maxNirfRank: 2,  preferType: 'Government' };
      if (rank <= 1500)  return { maxNirfRank: 4,  preferType: 'Government' };
      if (rank <= 5000)  return { maxNirfRank: 7  };
      if (rank <= 15000) return { maxNirfRank: 12 };
      if (rank <= 30000) return { maxNirfRank: 20 };
      return            { maxNirfRank: 30 };

    case 'JEE Main':
      if (rank <= 1000)  return { maxNirfRank: 5,  preferType: 'Government' };
      if (rank <= 10000) return { maxNirfRank: 10, preferType: 'Government' };
      if (rank <= 50000) return { maxNirfRank: 18 };
      if (rank <= 200000)return { maxNirfRank: 28 };
      return            { maxNirfRank: 50 };

    case 'NEET':
      if (rank <= 500)   return { maxNirfRank: 3  };
      if (rank <= 5000)  return { maxNirfRank: 8  };
      if (rank <= 25000) return { maxNirfRank: 15 };
      if (rank <= 100000)return { maxNirfRank: 25 };
      return            { maxNirfRank: 50 };

    case 'CAT':
      if (rank <= 50)   return { maxNirfRank: 2  };
      if (rank <= 200)  return { maxNirfRank: 5  };
      if (rank <= 1000) return { maxNirfRank: 12 };
      return           { maxNirfRank: 25 };

    case 'GATE':
      if (rank <= 200)  return { maxNirfRank: 3,  preferType: 'Government' };
      if (rank <= 1000) return { maxNirfRank: 8,  preferType: 'Government' };
      if (rank <= 5000) return { maxNirfRank: 15 };
      return           { maxNirfRank: 30 };

    default:
      return null;
  }
}

// GET /api/predictor?exam=JEE+Advanced&rank=5000&state=Maharashtra&category=General
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { exam = 'JEE Advanced', rank, state, category = 'General' } = req.query as Record<string, string>;

  let rankNum = parseInt(rank);
  if (!rank || isNaN(rankNum) || rankNum <= 0) {
    res.status(400).json({ error: 'A valid positive rank is required.' });
    return;
  }

  // Apply category adjustment
  rankNum = adjustRankForCategory(rankNum, category);

  const cutoff = getCutoff(exam, rankNum);
  if (!cutoff) {
    res.status(400).json({
      error: `Invalid exam "${exam}". Valid options: JEE Advanced, JEE Main, NEET, CAT, GATE`,
    });
    return;
  }

  const params: unknown[] = [cutoff.maxNirfRank];
  const extras: string[] = [];

  if (cutoff.preferType) {
    params.push(cutoff.preferType);
    extras.push(`type = $${params.length}`);
  }
  if (state && state.trim()) {
    params.push(state.trim());
    extras.push(`state = $${params.length}`);
  }

  const whereExtra = extras.length > 0 ? ` AND (${extras.join(' OR ')})` : '';

  try {
    // First try with type/state preference
    let result = await pool.query(
      `SELECT id, name, location, state, city, fees_min, fees_max, rating, type,
              ranking, placement_percentage, avg_package, highest_package,
              accreditation, image_url, courses, description
       FROM colleges
       WHERE ranking IS NOT NULL AND ranking <= $1${whereExtra}
       ORDER BY ranking ASC
       LIMIT 10`,
      params
    );

    // If fewer than 3 results, broaden search to all types
    if (result.rows.length < 3) {
      result = await pool.query(
        `SELECT id, name, location, state, city, fees_min, fees_max, rating, type,
                ranking, placement_percentage, avg_package, highest_package,
                accreditation, image_url, courses, description
         FROM colleges
         WHERE ranking IS NOT NULL AND ranking <= $1
         ORDER BY ranking ASC
         LIMIT 10`,
        [cutoff.maxNirfRank]
      );
    }

    res.json({
      exam,
      rank: rankNum,
      maxNirfRank: cutoff.maxNirfRank,
      total: result.rows.length,
      colleges: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Predictor query failed.' });
  }
});

export default router;
