export interface Entry {
  id: string;
  title: string;
  categoryId: string;
  category: string;
  description: string;
  location: string;
  coords: [number, number] | null;
  image: string | null;
  status: 'publish' | 'trash';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface GeographyNode {
  id: string;
  label: string;
  displayName: string;
  color: string;
  geojson?: string;
  geojsonUrl?: string;
  children?: GeographyNode[];
}

export interface GeographyScope extends GeographyNode {
  groupLabel: string;
  itemLabel: string;
}

export interface GeographyCountry {
  id: string;
  label: string;
  displayName: string;
  flag: string;
  center: [number, number];
  zoom: number;
  defaultScopeId: string;
  geojsonUrl?: string;
  color: string;
  scopes: GeographyScope[];
}

export interface GeographyConfig {
  defaultCountryId: string;
  countries: GeographyCountry[];
}

export interface GeographySelection {
  country: string;
  scope: string;
  area: string;
  subdivision: string;
}

export interface Settings {
  geographySelection: GeographySelection;
  showSidebarPanel: boolean;
  markerTagMode: string;
  mapTileLayer: string;
}

export interface PaginatedEntries {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}
