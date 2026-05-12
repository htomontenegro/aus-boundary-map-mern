interface Props {
  value: string;
  onChange: (q: string) => void;
  count: number;
}

export default function SearchOverlay({ value, onChange, count }: Props) {
  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search entries…"
          className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-full pl-8 pr-4 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{count}</span>
        )}
      </div>
    </div>
  );
}
