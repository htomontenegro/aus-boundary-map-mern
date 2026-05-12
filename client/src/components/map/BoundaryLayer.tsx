import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  url: string | null;
  color?: string;
}

export default function BoundaryLayer({ url, color = '#2563EB' }: Props) {
  const map      = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!url) return;

    let cancelled = false;
    fetch(url, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} loading boundary`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        const layer = L.geoJSON(data, {
          style: { color, weight: 2, fillOpacity: 0.06, fillColor: color },
        }).addTo(map);
        layerRef.current = layer;
        try { map.fitBounds(layer.getBounds(), { padding: [30, 30] }); } catch {}
      })
      .catch(err => console.error('Boundary load failed:', err));

    return () => { cancelled = true; };
  }, [map, url, color]);

  return null;
}
