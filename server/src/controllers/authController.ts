import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      res.status(400).json({ message: 'Valid email required' }); return;
    }
    if (!password || String(password).length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' }); return;
    }
    const safeRole: 'admin' | 'editor' = role === 'editor' ? 'editor' : 'admin';
    const exists = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (exists) { res.status(409).json({ message: 'Email already in use' }); return; }
    const user = await User.create({ email: String(email).trim().toLowerCase(), password, role: safeRole });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};
