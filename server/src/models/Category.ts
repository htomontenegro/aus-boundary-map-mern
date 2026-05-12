import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    id:        { type: String, required: true, unique: true, trim: true },
    label:     { type: String, required: true, trim: true },
    color:     { type: String, default: null },
    icon:      { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ICategory>('Category', CategorySchema);
