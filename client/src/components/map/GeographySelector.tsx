import type { UseGeographyReturn } from '../../hooks/useGeography';

interface Props {
  geo: UseGeographyReturn;
}

export default function GeographySelector({ geo }: Props) {
  const { config, selection, setSelection, activeScope, activeArea } = geo;
  if (!config) return null;

  return (
    <div className="absolute bottom-8 left-3 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg p-3 flex flex-col gap-2 min-w-[180px]">
      {/* Scope */}
      <select
        value={selection.scope}
        onChange={e => setSelection({ ...selection, scope: e.target.value, area: '', subdivision: '' })}
        className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {config.scopes.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      {/* Area */}
      {activeScope && activeScope.children && activeScope.children.length > 0 && (
        <select
          value={selection.area}
          onChange={e => setSelection({ ...selection, area: e.target.value, subdivision: '' })}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">All {activeScope.groupLabel}s</option>
          {activeScope.children.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      )}

      {/* Subdivision */}
      {activeArea && activeArea.children && activeArea.children.length > 0 && (
        <select
          value={selection.subdivision}
          onChange={e => setSelection({ ...selection, subdivision: e.target.value })}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">All {activeScope?.itemLabel}s</option>
          {activeArea.children.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
