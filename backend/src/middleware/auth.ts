import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
  body: any;
  params: any;
  query: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        name: string;
      };
      req.user = decoded;
    } catch {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}
