import type { UseGeographyReturn } from '../../hooks/useGeography';

interface Props {
  geo: UseGeographyReturn;
}

export default function GeographySelectorAdmin({ geo }: Props) {
  const { config, selection, setSelection, setCountry, activeCountry, activeScope, activeArea } = geo;
  if (!config) return <p className="text-sm text-gray-400">Loading geography config…</p>;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Country</label>
        <select
          value={selection.country}
          onChange={e => setCountry(e.target.value)}
          className="input"
        >
          {config.countries.map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Scope</label>
        <select
          value={selection.scope}
          onChange={e => setSelection({ ...selection, scope: e.target.value, area: '', subdivision: '' })}
          className="input"
        >
          {activeCountry?.scopes.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {activeScope?.children && activeScope.children.length > 0 && (
        <div>
          <label className="label">{activeScope.groupLabel || 'Area'}</label>
          <select
            value={selection.area}
            onChange={e => setSelection({ ...selection, area: e.target.value, subdivision: '' })}
            className="input"
          >
            <option value="">All {activeScope.groupLabel}s</option>
            {activeScope.children.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
      )}

      {activeArea?.children && activeArea.children.length > 0 && (
        <div>
          <label className="label">{activeScope?.itemLabel || 'Division'}</label>
          <select
            value={selection.subdivision}
            onChange={e => setSelection({ ...selection, subdivision: e.target.value })}
            className="input"
          >
            <option value="">All {activeScope?.itemLabel}s</option>
            {activeArea.children.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
