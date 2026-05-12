import { useEffect, useState, FormEvent } from 'react';
import { fetchSettings, saveSettings } from '../../services/api';
import { useGeography } from '../../hooks/useGeography';
import GeographySelectorAdmin from '../../components/admin/GeographySelectorAdmin';
import { TILE_LAYERS, DEFAULT_TILE_LAYER_ID } from '../../constants/tileLayers';
import type { Settings } from '../../types';

const LAYER_COLORS: Record<string, string> = {
  'osm':            'bg-green-100 border-green-300',
  'carto-light':    'bg-gray-50 border-gray-200',
  'carto-dark':     'bg-gray-800 border-gray-600',
  'carto-voyager':  'bg-blue-50 border-blue-200',
  'esri-satellite': 'bg-green-900 border-green-700',
  'esri-topo':      'bg-yellow-50 border-yellow-300',
  'topo':           'bg-lime-100 border-lime-300',
  'stadia-smooth':  'bg-stone-100 border-stone-300',
  'stadia-dark':    'bg-slate-800 border-slate-600',
};

const LAYER_TEXT: Record<string, string> = {
  'carto-dark':     'text-gray-200',
  'esri-satellite': 'text-green-200',
  'stadia-dark':    'text-slate-200',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved]       = useState(false);
  const [busy, setBusy]         = useState(false);
  const geo                     = useGeography();

  useEffect(() => {
    fetchSettings().then(s => {
      setSettings(s);
      if (s.geographySelection) {
        geo.setSelection(s.geographySelection);
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      await saveSettings({ ...settings, geographySelection: geo.selection });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <div className="p-6 text-gray-400">Loading settings…</div>;

  const activeLayer = settings.mapTileLayer || DEFAULT_TILE_LAYER_ID;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-2 text-sm mb-5">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Default geography */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Default Map Geography</h2>
          <GeographySelectorAdmin geo={geo} />
        </div>

        {/* Map tile layer */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Map Style</h2>
          <p className="text-xs text-gray-400 mb-4">Applies to the public map and entry form preview.</p>
          <div className="grid grid-cols-3 gap-3">
            {TILE_LAYERS.map(layer => {
              const isActive = activeLayer === layer.id;
              const swatch   = LAYER_COLORS[layer.id] ?? 'bg-gray-100 border-gray-200';
              const textColor = LAYER_TEXT[layer.id] ?? 'text-gray-700';
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, mapTileLayer: layer.id } : s)}
                  className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                    isActive
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Colour swatch */}
                  <div className={`h-10 rounded mb-2 border ${swatch}`} />
                  <p className="text-xs font-medium text-gray-800 leading-tight">{layer.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{layer.description}</p>
                  {isActive && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display options */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Display Options</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSidebarPanel}
              onChange={e => setSettings(s => s ? { ...s, showSidebarPanel: e.target.checked } : s)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">Show sidebar entry panel</span>
          </label>

          <div>
            <label className="label">Marker interaction mode</label>
            <select
              value={settings.markerTagMode}
              onChange={e => setSettings(s => s ? { ...s, markerTagMode: e.target.value } : s)}
              className="input"
            >
              <option value="clickable">Popup on click</option>
              <option value="hover">Tooltip on hover</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
