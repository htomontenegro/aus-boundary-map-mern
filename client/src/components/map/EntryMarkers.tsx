import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Entry, Category } from '../../types';

function pinSVG(color: string) {
  return `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.82 0 0 5.82 0 13c0 8.67 13 21 13 21S26 21.67 26 13C26 5.82 20.18 0 13 0z" fill="${color}"/>
    <circle cx="13" cy="13" r="5.5" fill="white" fill-opacity="0.9"/>
  </svg>`;
}

function makeIcon(color: string) {
  return L.divIcon({
    className: 'entry-pin',
    html: pinSVG(color),
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -36],
  });
}

interface Props {
  entries: Entry[];
  categoriesById: Record<string, Category>;
}

export default function EntryMarkers({ entries, categoriesById }: Props) {
  return (
    <>
      {entries
        .filter(e => e.coords && e.coords.length === 2)
        .map(entry => {
          const cat   = categoriesById[entry.categoryId];
          const color = cat?.color || '#3B82F6';
          return (
            <Marker key={entry.id} position={entry.coords!} icon={makeIcon(color)}>
              <Popup maxWidth={280}>
                <div className="entry-popup">
                  {entry.image && (
                    <img src={entry.image} alt={entry.title} className="w-full h-28 object-cover rounded mb-2" />
                  )}
                  <p className="font-semibold text-gray-900 text-sm">{entry.title}</p>
                  {cat && (
                    <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: cat.color || '#555' }}>
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.label}</span>
                    </span>
                  )}
                  {entry.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {entry.location}</p>
                  )}
                  {entry.description && (
                    <div
                      className="text-xs text-gray-700 mt-2 leading-relaxed line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: entry.description }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}
