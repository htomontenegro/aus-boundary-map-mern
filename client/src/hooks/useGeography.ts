import { useState, useEffect } from 'react';
import type { GeographyConfig, GeographySelection, GeographyNode } from '../types';

export function useGeography() {
  const [config, setConfig]       = useState<GeographyConfig | null>(null);
  const [selection, setSelection] = useState<GeographySelection>({
    country: 'australia', scope: 'federal', area: '', subdivision: '',
  });

  useEffect(() => {
    fetch('/geographies.json')
      .then(r => r.json())
      .then((cfg: GeographyConfig) => {
        setConfig(cfg);
        const defaultCountry = cfg.countries.find(c => c.id === cfg.defaultCountryId);
        setSelection(s => ({ ...s, scope: defaultCountry?.defaultScopeId ?? '' }));
      })
      .catch(err => console.error('Failed to load geography config:', err));
  }, []);

  const activeCountry = config?.countries.find(c => c.id === selection.country) ?? null;
  const activeScope   = activeCountry?.scopes.find(s => s.id === selection.scope) ?? null;
  const activeArea    = activeScope?.children?.find(a => a.id === selection.area) ?? null;

  const resolvedNode: GeographyNode | null =
    (selection.subdivision && activeArea?.children?.find(s => s.id === selection.subdivision)) ||
    (selection.area && activeArea) ||
    (selection.scope && activeScope) ||
    activeCountry ||
    null;

  const boundaryUrl: string | null =
    resolvedNode?.geojsonUrl || (resolvedNode?.geojson ? `/${resolvedNode.geojson}` : null);

  const mapConfig = {
    center: (activeCountry?.center ?? [-25.2744, 133.7751]) as [number, number],
    zoom:   activeCountry?.zoom ?? 4,
  };

  const setCountry = (countryId: string) => {
    const c = config?.countries.find(co => co.id === countryId);
    setSelection({ country: countryId, scope: c?.defaultScopeId ?? '', area: '', subdivision: '' });
  };

  return {
    config, selection, setSelection, setCountry,
    activeCountry, activeScope, activeArea,
    resolvedNode, boundaryUrl, mapConfig,
  };
}

export type UseGeographyReturn = ReturnType<typeof useGeography>;
