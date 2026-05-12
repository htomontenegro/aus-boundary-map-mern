import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';

import { fetchPublicEntries, fetchPublicCategories, fetchSettings } from '../services/api';
import { useGeography } from '../hooks/useGeography';
import type { Entry, Category } from '../types';
import { getTileLayer, DEFAULT_TILE_LAYER_ID } from '../constants/tileLayers';

import BoundaryLayer    from '../components/map/BoundaryLayer';
import EntryMarkers     from '../components/map/EntryMarkers';
import CategoryTabs,    { ALL_CATEGORY_ID } from '../components/map/CategoryTabs';
import SearchOverlay    from '../components/map/SearchOverlay';
import GeographySelector from '../components/map/GeographySelector';
import SidebarPanel     from '../components/map/SidebarPanel';
import LegendBox        from '../components/map/LegendBox';

// Inner component so useMap() works inside MapContainer
function MapLayers({ entries, categoriesById, boundaryUrl }: {
  entries: Entry[];
  categoriesById: Record<string, Category>;
  boundaryUrl: string | null;
}) {
  return (
    <>
      <BoundaryLayer url={boundaryUrl} />
      <EntryMarkers entries={entries} categoriesById={categoriesById} />
    </>
  );
}

export default function PublicMapPage() {
  const [entries, setEntries]         = useState<Entry[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [categoriesById, setCatById]  = useState<Record<string, Category>>({});
  const [activeCat, setActiveCat]     = useState(ALL_CATEGORY_ID);
  const [search, setSearch]           = useState('');
  const [visible, setVisible]         = useState<Entry[]>([]);
  const [error, setError]             = useState('');
  const [tileLayerId, setTileLayerId] = useState(DEFAULT_TILE_LAYER_ID);
  const fuseRef                       = useRef<Fuse<Entry> | null>(null);
  const geo                           = useGeography();

  // Load data on mount — failures show a warning but don't break the map
  useEffect(() => {
    const loadEntries = fetchPublicEntries().catch((err) => {
      const status = err?.response?.status;
      const msg = status
        ? `API error ${status} loading entries`
        : 'Could not reach the server — is it running on port 4001?';
      setError(msg);
      return [] as import('../types').Entry[];
    });

    const loadCategories = fetchPublicCategories().catch(() => [] as Category[]);
    const loadSettings   = fetchSettings().catch(() => null);

    Promise.all([loadEntries, loadCategories, loadSettings]).then(([e, c, s]) => {
      setEntries(e);
      setCategories(c);
      const byId = Object.fromEntries(c.map((cat: Category) => [cat.id, cat]));
      setCatById(byId);
      if (s?.mapTileLayer) setTileLayerId(s.mapTileLayer);
      if (e.length > 0) {
        fuseRef.current = new Fuse(e, {
          keys: ['title', 'location', 'description', 'category'],
          threshold: 0.35,
          minMatchCharLength: 2,
        });
      }
    });
  }, []);

  // Filter entries when search/category changes
  useEffect(() => {
    let result = entries;
    if (search.trim() && fuseRef.current) {
      result = fuseRef.current.search(search).map(r => r.item);
    }
    if (activeCat !== ALL_CATEGORY_ID) {
      result = result.filter(e => e.categoryId === activeCat);
    }
    setVisible(result);
  }, [entries, activeCat, search]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SidebarPanel
        entries={visible}
        categoriesById={categoriesById}
      />

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-[1001] pointer-events-none">
          <div className="pointer-events-auto">
            <CategoryTabs categories={categories} active={activeCat} onChange={setActiveCat} />
          </div>
          <div className="pointer-events-auto">
            <SearchOverlay value={search} onChange={setSearch} count={visible.length} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1001] bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-2 text-sm shadow flex items-center gap-3 max-w-lg">
            <span>⚠️</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-amber-500 hover:text-amber-700 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Leaflet map */}
        <MapContainer
          center={[-25.2744, 133.7751]}
          zoom={5}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            key={tileLayerId}
            url={getTileLayer(tileLayerId).url}
            attribution={getTileLayer(tileLayerId).attribution}
          />
          <MapLayers
            entries={visible}
            categoriesById={categoriesById}
            boundaryUrl={geo.boundaryUrl}
          />
        </MapContainer>

        {/* Legend box */}
        <LegendBox />

        {/* Geography selector */}
        <GeographySelector geo={geo} />

        {/* Admin link */}
        <div className="absolute bottom-3 right-3 z-[1000]">
          <Link
            to="/admin"
            className="text-xs text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded px-2 py-1"
          >
            Admin ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
