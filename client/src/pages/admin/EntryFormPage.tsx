import { useEffect, useState, useRef, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createEntry, updateEntry, fetchEntry, fetchAdminCategories, fetchSettings } from '../../services/api';
import { useGeography } from '../../hooks/useGeography';
import type { Category } from '../../types';
import GeographySelectorAdmin from '../../components/admin/GeographySelectorAdmin';
import { getTileLayer, DEFAULT_TILE_LAYER_ID } from '../../constants/tileLayers';

interface FormState {
  title: string;
  description: string;
  location: string;
  lat: string;
  lng: string;
  image: string;
  categoryId: string;
}

const EMPTY: FormState = { title: '', description: '', location: '', lat: '', lng: '', image: '', categoryId: '' };

const AUS_CENTER: [number, number] = [-25.2744, 133.7751];

const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">
    <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill="#3B82F6"/>
    <circle cx="13" cy="13" r="5" fill="white"/>
  </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
});

function MapSync({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const prevCoords = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;
    const next: [number, number] = [lat, lng];
    if (
      prevCoords.current &&
      prevCoords.current[0] === lat &&
      prevCoords.current[1] === lng
    ) return;
    prevCoords.current = next;
    map.setView(next, Math.max(map.getZoom(), 10));
  }, [lat, lng, map]);

  return null;
}

export default function EntryFormPage() {
  const { id }                          = useParams<{ id: string }>();
  const isEdit                          = Boolean(id);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [errors, setErrors]             = useState<Partial<FormState>>({});
  const [busy, setBusy]                 = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(isEdit);
  const [geocoding, setGeocoding]       = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [tileLayerId, setTileLayerId]   = useState(DEFAULT_TILE_LAYER_ID);
  const geo                             = useGeography();
  const navigate                        = useNavigate();

  useEffect(() => {
    fetchAdminCategories().then(setCategories);
    fetchSettings().then(s => { if (s?.mapTileLayer) setTileLayerId(s.mapTileLayer); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchEntry(id).then(entry => {
      setForm({
        title:       entry.title,
        description: entry.description,
        location:    entry.location,
        lat:         entry.coords ? String(entry.coords[0]) : '',
        lng:         entry.coords ? String(entry.coords[1]) : '',
        image:       entry.image || '',
        categoryId:  entry.categoryId,
      });
    }).finally(() => setLoadingEntry(false));
  }, [id]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (key === 'location') setGeocodeError('');
  };

  const detectCoords = async () => {
    if (!form.location.trim()) return;
    setGeocoding(true);
    setGeocodeError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.location)}&format=json&limit=1&countrycodes=au`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setGeocodeError('No location found. Try a more specific address.');
      } else {
        setForm(f => ({ ...f, lat: String(parseFloat(data[0].lat).toFixed(6)), lng: String(parseFloat(data[0].lon).toFixed(6)) }));
      }
    } catch {
      setGeocodeError('Geocoding failed. Check your connection and try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    const hasLat = form.lat !== '';
    const hasLng = form.lng !== '';
    if (hasLat !== hasLng) errs.lat = 'Both latitude and longitude are required together';
    if (form.lat && (isNaN(+form.lat) || +form.lat < -90 || +form.lat > 90))
      errs.lat = 'Latitude must be between -90 and 90';
    if (form.lng && (isNaN(+form.lng) || +form.lng < -180 || +form.lng > 180))
      errs.lng = 'Longitude must be between -180 and 180';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const selectedCategory = categories.find(c => c.id === form.categoryId);
      const payload = {
        title:       form.title.trim(),
        description: form.description,
        location:    form.location,
        coords:      form.lat && form.lng ? [+form.lat, +form.lng] as [number, number] : null,
        image:       form.image || null,
        categoryId:  form.categoryId,
        category:    selectedCategory?.label || '',
      };
      if (isEdit) await updateEntry(id!, payload);
      else await createEntry(payload);
      navigate('/admin/entries');
    } catch (err: any) {
      setErrors({ title: err.response?.data?.message || 'Save failed' });
    } finally {
      setBusy(false);
    }
  };

  const parsedLat = form.lat !== '' && !isNaN(+form.lat) && +form.lat >= -90  && +form.lat <= 90  ? +form.lat : null;
  const parsedLng = form.lng !== '' && !isNaN(+form.lng) && +form.lng >= -180 && +form.lng <= 180 ? +form.lng : null;
  const hasPin    = parsedLat !== null && parsedLng !== null;

  if (loadingEntry) return <div className="p-6 text-gray-400">Loading entry…</div>;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
      {/* ── Left: form ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/entries" className="text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Entry' : 'Add New Entry'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={set('title')} className={`input ${errors.title ? 'border-red-400' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={5} className="input resize-y" />
          </div>

          {/* Location + Detect */}
          <div>
            <label className="label">Location</label>
            <div className="flex gap-2">
              <input
                value={form.location}
                onChange={set('location')}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), detectCoords())}
                className="input flex-1"
                placeholder="e.g. 6 Macquarie St, Sydney NSW 2000"
              />
              <button
                type="button"
                onClick={detectCoords}
                disabled={geocoding || !form.location.trim()}
                className="btn-secondary whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
              >
                {geocoding ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                )}
                {geocoding ? 'Detecting…' : 'Detect'}
              </button>
            </div>
            {geocodeError && <p className="text-red-500 text-xs mt-1">{geocodeError}</p>}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input value={form.lat} onChange={set('lat')} type="number" step="any" className={`input ${errors.lat ? 'border-red-400' : ''}`} placeholder="-33.8688" />
              {errors.lat && <p className="text-red-500 text-xs mt-1">{errors.lat}</p>}
            </div>
            <div>
              <label className="label">Longitude</label>
              <input value={form.lng} onChange={set('lng')} type="number" step="any" className={`input ${errors.lng ? 'border-red-400' : ''}`} placeholder="151.2093" />
              {errors.lng && <p className="text-red-500 text-xs mt-1">{errors.lng}</p>}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="label">Image URL</label>
            <input value={form.image} onChange={set('image')} type="url" className="input" placeholder="https://…" />
            {form.image && (
              <img src={form.image} alt="preview" className="mt-2 h-24 rounded object-cover border" />
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select value={form.categoryId} onChange={set('categoryId')} className="input">
              <option value="">— None —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ''}{c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Geography */}
          <div>
            <label className="label">Geography</label>
            <GeographySelectorAdmin geo={geo} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving…' : isEdit ? 'Update Entry' : 'Add Entry'}
            </button>
            <Link to="/admin/entries" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>

      {/* ── Right: map preview ── */}
      <div className="lg:sticky lg:top-6">
        <p className="label mb-2">Map Preview</p>
        <div className="rounded-lg overflow-hidden border border-gray-200 h-[500px] relative">
          <MapContainer
            center={hasPin ? [parsedLat!, parsedLng!] : AUS_CENTER}
            zoom={hasPin ? 13 : 4}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              key={tileLayerId}
              url={getTileLayer(tileLayerId).url}
              attribution={getTileLayer(tileLayerId).attribution}
            />
            <MapSync lat={parsedLat} lng={parsedLng} />
            {hasPin && (
              <Marker
                position={[parsedLat!, parsedLng!]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const { lat, lng } = (e.target as L.Marker).getLatLng();
                    setForm(f => ({
                      ...f,
                      lat: String(lat.toFixed(6)),
                      lng: String(lng.toFixed(6)),
                    }));
                  },
                }}
              />
            )}
          </MapContainer>
          {!hasPin && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <span className="bg-white/90 text-gray-500 text-xs px-3 py-1.5 rounded-full shadow">
                Enter an address and click Detect, or fill in coordinates to place the pin
              </span>
            </div>
          )}
        </div>
        {hasPin && (
          <p className="text-xs text-gray-400 mt-1.5 text-center">Drag the pin to adjust the position</p>
        )}
      </div>
    </div>
  );
}
