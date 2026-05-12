import type { Entry, Category } from '../../types';

interface Props {
  entries: Entry[];
  categoriesById: Record<string, Category>;
  onEntryClick?: (entry: Entry) => void;
}

export default function SidebarPanel({ entries, categoriesById, onEntryClick }: Props) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">Entries</h2>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{entries.length}</span>
      </div>

      <div className="sidebar-entries flex-1">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No entries match your filters.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {entries.map(entry => {
              const cat = categoriesById[entry.categoryId];
              return (
                <li
                  key={entry.id}
                  onClick={() => onEntryClick?.(entry)}
                  className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {entry.image ? (
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded flex-shrink-0 flex items-center justify-center text-white text-lg"
                      style={{ background: cat?.color || '#E5E7EB' }}
                    >
                      {cat?.icon || '📍'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                    {entry.location && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">📍 {entry.location}</p>
                    )}
                    {cat && (
                      <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: cat.color || '#555' }}>
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.label}</span>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
