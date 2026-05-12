import { Request, Response, NextFunction } from 'express';
import Entry, { IEntry } from '../models/Entry';

type LeanEntry = {
  _id: unknown;
  title: string;
  categoryId: string;
  category: string;
  description: string;
  location: string;
  coords: [number, number] | null;
  image: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalise(e: LeanEntry) {
  return {
    id:          e._id,
    title:       e.title,
    categoryId:  e.categoryId,
    category:    e.category,
    description: e.description,
    location:    e.location,
    coords:      e.coords && e.coords.length === 2 ? e.coords : null,
    image:       e.image || null,
    status:      e.status,
    createdAt:   e.createdAt,
    updatedAt:   e.updatedAt,
  };
}

function validateCoords(coords: unknown): [number, number] | null {
  if (!coords || !Array.isArray(coords) || coords.length < 2) return null;
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

export const getPublishedEntries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const entries = await Entry.find({ status: 'publish' }).lean();
    res.json(entries.map(e => normalise(e as unknown as LeanEntry)));
  } catch (err) { next(err); }
};

export const getAllEntries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query as Record<string, string>;
    const rawPage  = parseInt(req.query.page  as string, 10);
    const rawLimit = parseInt(req.query.limit as string, 10);
    const page  = isNaN(rawPage)  || rawPage  < 1 ? 1  : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      Entry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Entry.countDocuments(filter),
    ]);
    res.json({ entries: entries.map(e => normalise(e as unknown as LeanEntry)), total, page, limit });
  } catch (err) { next(err); }
};

export const getEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const entry = await Entry.findById(req.params.id).lean();
    if (!entry) { res.status(404).json({ message: 'Entry not found' }); return; }
    res.json(normalise(entry as unknown as LeanEntry));
  } catch (err) { next(err); }
};

export const createEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, categoryId, category, description, location, coords, image, status } = req.body;
    if (!title?.trim()) { res.status(400).json({ message: 'Title is required' }); return; }
    const entry = await Entry.create({
      title: title.trim(),
      categoryId: categoryId || '',
      category: category || '',
      description: description || '',
      location: location || '',
      coords: validateCoords(coords),
      image: image || null,
      status: status || 'publish',
    });
    res.status(201).json(normalise(entry.toObject() as unknown as LeanEntry));
  } catch (err) { next(err); }
};

export const updateEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, categoryId, category, description, location, coords, image, status } = req.body;
    if (title !== undefined && !title.trim()) {
      res.status(400).json({ message: 'Title cannot be empty' }); return;
    }
    const update: Partial<IEntry> = {};
    if (title !== undefined)       update.title = title.trim();
    if (categoryId !== undefined)  update.categoryId = categoryId;
    if (category !== undefined)    update.category = category;
    if (description !== undefined) update.description = description;
    if (location !== undefined)    update.location = location;
    if (coords !== undefined)      update.coords = validateCoords(coords);
    if (image !== undefined)       update.image = image || null;
    if (status !== undefined)      update.status = status;

    const entry = await Entry.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!entry) { res.status(404).json({ message: 'Entry not found' }); return; }
    res.json(normalise(entry as unknown as LeanEntry));
  } catch (err) { next(err); }
};

export const deleteEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) { res.status(404).json({ message: 'Entry not found' }); return; }
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const bulkAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids, action, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'ids array required' }); return;
    }
    if (ids.length > 500) {
      res.status(400).json({ message: 'Too many ids (max 500)' }); return;
    }
    if (action === 'delete') {
      await Entry.deleteMany({ _id: { $in: ids } });
    } else if (action === 'status' && status) {
      await Entry.updateMany({ _id: { $in: ids } }, { status });
    } else {
      res.status(400).json({ message: 'Invalid action' }); return;
    }
    res.json({ success: true, count: ids.length });
  } catch (err) { next(err); }
};
