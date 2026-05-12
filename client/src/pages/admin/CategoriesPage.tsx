import { useEffect, useState } from 'react';
import { fetchAdminCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import type { Category } from '../../types';

const EMPTY: Partial<Category> = { id: '', label: '', color: '', icon: '', sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm]             = useState<Partial<Category>>(EMPTY);
  const [editing, setEditing]       = useState<string | null>(null);
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');

  const load = () => fetchAdminCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  const set = (key: keyof Category) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError('');
    if (!form.id?.trim() || !form.label?.trim()) { setError('ID and Label are required'); return; }
    try {
      if (editing) await updateCategory(editing, form);
      else await createCategory(form);
      setForm(EMPTY); setEditing(null);
      flash(editing ? 'Category updated.' : 'Category added.');
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (cat: Category) => { setEditing(cat.id); setForm(cat); };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete category "${id}"? Entries with this category will be uncategorised.`)) return;
    await deleteCategory(id);
    flash('Category deleted.');
    load();
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      </div>

      {notice && <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-2 text-sm mb-4">{notice}</div>}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">ID (slug)</label>
            <input
              value={form.id || ''}
              onChange={set('id')}
              className="input"
              placeholder="e.g. labor"
              disabled={!!editing}
            />
          </div>
          <div>
            <label className="label">Label</label>
            <input value={form.label || ''} onChange={set('label')} className="input" placeholder="e.g. Labor Party" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.color || '#3B82F6'}
                onChange={set('color')}
                className="h-9 w-12 rounded border p-0.5 cursor-pointer"
              />
              <input value={form.color || ''} onChange={set('color')} className="input" placeholder="#3B82F6" />
            </div>
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input value={form.icon || ''} onChange={set('icon')} className="input" placeholder="🔵" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="btn-primary text-sm">{editing ? 'Update' : 'Add Category'}</button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="btn-secondary text-sm">Cancel</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left font-medium text-gray-700">ID</th>
              <th className="p-3 text-left font-medium text-gray-700">Label</th>
              <th className="p-3 text-left font-medium text-gray-700">Color</th>
              <th className="p-3 text-left font-medium text-gray-700">Icon</th>
              <th className="p-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No categories yet.</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-600">{cat.id}</td>
                <td className="p-3 font-medium text-gray-900">{cat.label}</td>
                <td className="p-3">
                  {cat.color ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-gray-500 text-xs font-mono">{cat.color}</span>
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="p-3 text-lg">{cat.icon || <span className="text-gray-300">—</span>}</td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
