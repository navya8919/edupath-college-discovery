import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/predictor?exam=JEE+Advanced&rank=5000&state=Maharashtra&category=General
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { exam = 'JEE Advanced', rank, state, category = 'General' } = req.query as Record<string, string>;

  const rankNum = parseInt(rank);
  if (!rank || isNaN(rankNum) || rankNum <= 0) {
    res.status(400).json({ error: 'A valid positive rank is required.' });
    return;
  }

  try {
    // 1. Fetch all colleges (or filter by state in DB if state provided)
    const params: unknown[] = [];
    let stateFilter = '';
    
    if (state && state.trim()) {
      stateFilter = 'WHERE state = $1';
      params.push(state.trim());
    }

    const result = await pool.query(
      `SELECT id, name, location, state, city, fees_min, fees_max, rating, type,
              ranking, placement_percentage, avg_package, highest_package,
              accreditation, image_url, courses, description, cutoffs
       FROM colleges
       ${stateFilter}
       ORDER BY ranking ASC NULLS LAST`,
      params
    );

    const colleges = result.rows;
    const eligibleColleges = [];

    // 2. Filter in memory to handle JSON seamlessly across SQLite and PG
    for (const college of colleges) {
      // Parse cutoffs if it's a string (SQLite), otherwise use as is (PG JSONB)
      let cutoffsObj: Record<string, Record<string, number>> = {};
      try {
        cutoffsObj = typeof college.cutoffs === 'string' 
          ? JSON.parse(college.cutoffs) 
          : (college.cutoffs || {});
      } catch (e) {
        continue;
      }

      const examCutoffs = cutoffsObj[exam];
      if (!examCutoffs) continue; // College doesn't accept this exam

      const categoryCutoff = examCutoffs[category];
      if (!categoryCutoff) continue; // No cutoff data for this category

      // Check if user's rank is within the cutoff (lower rank number is better)
      if (rankNum <= categoryCutoff) {
        eligibleColleges.push(college);
      }
    }

    // 3. If no colleges found, we could do a fallback (optional), but real prediction is strict
    // We'll just return what matched. If state was provided and no matches, maybe drop state and try again.
    let finalColleges = eligibleColleges;
    
    if (finalColleges.length === 0 && state && state.trim()) {
      // Fallback: search across all states
      const allResult = await pool.query(
        `SELECT id, name, location, state, city, fees_min, fees_max, rating, type,
                ranking, placement_percentage, avg_package, highest_package,
                accreditation, image_url, courses, description, cutoffs
         FROM colleges
         ORDER BY ranking ASC NULLS LAST`
      );
      
      const allColleges = allResult.rows;
      finalColleges = [];
      
      for (const college of allColleges) {
        let cutoffsObj: Record<string, Record<string, number>> = {};
        try {
          cutoffsObj = typeof college.cutoffs === 'string' 
            ? JSON.parse(college.cutoffs) 
            : (college.cutoffs || {});
        } catch (e) {
          continue;
        }

        const examCutoffs = cutoffsObj[exam];
        if (examCutoffs && examCutoffs[category] && rankNum <= examCutoffs[category]) {
          finalColleges.push(college);
        }
      }
    }

    // Take top 10
    finalColleges = finalColleges.slice(0, 10);

    // Provide a proxy maxNirfRank for the UI chance bar 
    // (We use the worst ranked college in the eligible list or fallback to 50)
    const maxNirfRank = finalColleges.length > 0 
      ? Math.max(...finalColleges.map(c => Number(c.ranking) || 50))
      : 50;

    res.json({
      exam,
      rank: rankNum,
      maxNirfRank,
      total: finalColleges.length,
      colleges: finalColleges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Predictor query failed.' });
  }
});

export default router;
