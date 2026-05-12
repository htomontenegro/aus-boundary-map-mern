import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminEntries, deleteEntry, bulkEntries } from '../../services/api';
import type { Entry, PaginatedEntries } from '../../types';

const LIMIT = 20;

export default function EntriesPage() {
  const [data, setData]         = useState<PaginatedEntries>({ entries: [], total: 0, page: 1, limit: LIMIT });
  const [status, setStatus]     = useState<'publish' | 'trash'>('publish');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [notice, setNotice]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchAdminEntries({ status, search: search || undefined, page, limit: LIMIT });
      setData(result);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  const handleBulk = async (action: string, newStatus?: string) => {
    if (!selected.length) return;
    await bulkEntries({ ids: selected, action, status: newStatus });
    flash(`${selected.length} entries updated.`);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry permanently?')) return;
    await deleteEntry(id);
    flash('Entry deleted.');
    load();
  };

  const totalPages = Math.ceil(data.total / LIMIT);
  const allSelected = data.entries.length > 0 && selected.length === data.entries.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Entries</h1>
        <Link to="/admin/entries/new" className="btn-primary text-sm">+ Add Entry</Link>
      </div>

      {/* Notice */}
      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-2 text-sm mb-4">{notice}</div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {(['publish', 'trash'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 text-sm capitalize font-medium transition-colors ${
              status === s
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search + bulk */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="input w-64"
        />
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">{selected.length} selected</span>
            {status === 'publish' && (
              <button onClick={() => handleBulk('status', 'trash')} className="btn-danger-sm">Trash</button>
            )}
            {status === 'trash' && (
              <button onClick={() => handleBulk('status', 'publish')} className="btn-secondary-sm">Restore</button>
            )}
            <button onClick={() => handleBulk('delete')} className="btn-danger-sm">Delete permanently</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => setSelected(e.target.checked ? data.entries.map(en => en.id) : [])}
                />
              </th>
              <th className="p-3 text-left font-medium text-gray-700">Title</th>
              <th className="p-3 text-left font-medium text-gray-700">Category</th>
              <th className="p-3 text-left font-medium text-gray-700">Location</th>
              <th className="p-3 text-left font-medium text-gray-700">Coords</th>
              <th className="p-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading…</td></tr>
            ) : data.entries.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No entries found.</td></tr>
            ) : data.entries.map((entry: Entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.id)}
                    onChange={e => setSelected(s =>
                      e.target.checked ? [...s, entry.id] : s.filter(x => x !== entry.id)
                    )}
                  />
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {entry.image && (
                    <img src={entry.image} alt="" className="w-8 h-8 rounded object-cover inline-block mr-2 align-middle" />
                  )}
                  {entry.title}
                </td>
                <td className="p-3 text-gray-600">{entry.category || <span className="text-gray-300">—</span>}</td>
                <td className="p-3 text-gray-600">{entry.location || <span className="text-gray-300">—</span>}</td>
                <td className="p-3 text-gray-500 font-mono text-xs">
                  {entry.coords ? `${entry.coords[0].toFixed(4)}, ${entry.coords[1].toFixed(4)}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link to={`/admin/entries/${entry.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>{data.total} total entries</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40">← Prev</button>
          <span>Page {page} of {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40">Next →</button>
        </div>
      </div>
    </div>
  );
}
