import { Schema, model, Document } from 'mongoose';

export interface IEntry extends Document {
  title: string;
  categoryId: string;
  category: string;
  description: string;
  location: string;
  coords: [number, number] | null;
  image: string | null;
  status: 'publish' | 'trash';
  createdAt: Date;
  updatedAt: Date;
}

const EntrySchema = new Schema<IEntry>(
  {
    title:       { type: String, required: true, maxlength: 255, trim: true },
    categoryId:  { type: String, default: '' },
    category:    { type: String, default: '' },
    description: { type: String, default: '' },
    location:    { type: String, default: '' },
    coords:      { type: [Number], default: null },
    image:       { type: String, default: null },
    status:      { type: String, enum: ['publish', 'trash'], default: 'publish' },
  },
  { timestamps: true }
);

EntrySchema.index({ status: 1 });
EntrySchema.index({ categoryId: 1 });
EntrySchema.index({ title: 'text', location: 'text', description: 'text' });

export default model<IEntry>('Entry', EntrySchema);
