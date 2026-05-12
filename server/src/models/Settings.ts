import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  geographySelection: {
    country: string;
    scope: string;
    area: string;
    subdivision: string;
  };
  showSidebarPanel: boolean;
  markerTagMode: string;
  mapTileLayer: string;
}

const SettingsSchema = new Schema<ISettings>({
  geographySelection: {
    country:     { type: String, default: 'australia' },
    scope:       { type: String, default: 'federal' },
    area:        { type: String, default: '' },
    subdivision: { type: String, default: '' },
  },
  showSidebarPanel: { type: Boolean, default: true },
  markerTagMode:    { type: String, default: 'clickable' },
  mapTileLayer:     { type: String, default: 'osm' },
});

export default model<ISettings>('Settings', SettingsSchema);
