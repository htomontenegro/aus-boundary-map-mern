import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Entry from '../models/Entry';

type LeanCategory = {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
};

function normalise(c: LeanCategory) {
  return { id: c.id, label: c.label, color: c.color || null, icon: c.icon || null, sortOrder: c.sortOrder };
}

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cats = await Category.find().sort({ sortOrder: 1, id: 1 }).lean();
    res.json(cats.map(c => normalise(c as unknown as LeanCategory)));
  } catch (err) { next(err); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, label, color, icon, sortOrder } = req.body;
    if (!id?.trim() || !label?.trim()) {
      res.status(400).json({ message: 'id and label are required' }); return;
    }
    const exists = await Category.findOne({ id: id.trim() });
    if (exists) { res.status(409).json({ message: 'Category ID already exists' }); return; }
    const cat = await Category.create({ id: id.trim(), label: label.trim(), color: color || null, icon: icon || null, sortOrder: sortOrder || 0 });
    res.status(201).json(normalise(cat.toObject() as unknown as LeanCategory));
  } catch (err) { next(err); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { label, color, icon, sortOrder } = req.body;
    const cat = await Category.findOneAndUpdate(
      { id: req.params.id },
      { label, color: color || null, icon: icon || null, ...(sortOrder !== undefined && { sortOrder }) },
      { new: true }
    ).lean();
    if (!cat) { res.status(404).json({ message: 'Category not found' }); return; }

    if (label) {
      await Entry.updateMany({ categoryId: req.params.id }, { category: label });
    }
    res.json(normalise(cat as unknown as LeanCategory));
  } catch (err) { next(err); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cat = await Category.findOneAndDelete({ id: req.params.id });
    if (!cat) { res.status(404).json({ message: 'Category not found' }); return; }
    await Entry.updateMany({ categoryId: req.params.id }, { categoryId: '', category: '' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
