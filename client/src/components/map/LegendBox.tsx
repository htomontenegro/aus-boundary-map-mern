import { useState } from 'react';

type Row = { icon: string; label: string };
type Section = { title: string; rows: Row[] };

const SECTIONS: Section[] = [
  {
    title: 'Tech Stack',
    rows: [
      { icon: '⚛️', label: 'React 18 + TypeScript' },
      { icon: '🗺️', label: 'Leaflet / React-Leaflet' },
      { icon: '🍃', label: 'MongoDB + Mongoose' },
      { icon: '🚂', label: 'Express (Node.js)' },
      { icon: '⚡', label: 'Vite + Tailwind CSS' },
    ],
  },
  {
    title: 'Boundary Data',
    rows: [
      { icon: '🏛️', label: 'ABS GeoJSON API (geo.abs.gov.au)' },
      { icon: '📐', label: 'WGS84 / EPSG:4326 projection' },
      { icon: '🗂️', label: 'GeoJSON format (RFC 7946)' },
    ],
  },
  {
    title: 'Political Divisions',
    rows: [
      { icon: '🗳️', label: 'Australian Electoral Divisions' },
      { icon: '🏛️', label: 'Federal & State parliaments' },
      { icon: '📋', label: 'ASGS 2021 geography standard' },
    ],
  },
 
];

export default function LegendBox() {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
      {open ? (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              About this map
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs leading-none px-1"
              aria-label="Close legend"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.rows.map((row) => (
                    <li key={row.label} className="flex items-center gap-1.5 text-xs text-gray-700">
                      <span className="text-sm leading-none">{row.icon}</span>
                      {row.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-full px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
          aria-label="Open legend"
        >
          ⓘ Legend
        </button>
      )}
    </div>
  );
}
