import type { Category } from '../../types';

export const ALL_CATEGORY_ID = '__all__';

interface Props {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md px-3 py-2 rounded-full max-w-[90vw] overflow-x-auto">
      <button
        onClick={() => onChange(ALL_CATEGORY_ID)}
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
          active === ALL_CATEGORY_ID
            ? 'bg-gray-800 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            active === cat.id ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={active === cat.id ? { background: cat.color || '#3B82F6' } : undefined}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
