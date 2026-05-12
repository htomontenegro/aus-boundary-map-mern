import { Request, Response, NextFunction } from 'express';
import Settings from '../models/Settings';

export const getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let settings = await Settings.findOne().lean();
    if (!settings) {
      await Settings.create({});
      settings = await Settings.findOne().lean();
    }
    res.json(settings);
  } catch (err) { next(err); }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { geographySelection, showSidebarPanel, markerTagMode, mapTileLayer } = req.body;
    const update: Record<string, any> = {};
    if (geographySelection) update.geographySelection = geographySelection;
    if (showSidebarPanel !== undefined) update.showSidebarPanel = Boolean(showSidebarPanel);
    if (markerTagMode) update.markerTagMode = markerTagMode;
    if (mapTileLayer) update.mapTileLayer = mapTileLayer;

    const settings = await Settings.findOneAndUpdate({}, update, { upsert: true, new: true }).lean();
    res.json(settings);
  } catch (err) { next(err); }
};
