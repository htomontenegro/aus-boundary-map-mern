import fs from 'fs';
import path from 'path';

type GeographyNode = {
  id: string;
  label: string;
  displayName?: string;
  color?: string;
  geojsonUrl?: string;
  children?: GeographyNode[];
};

type GeographyScope = GeographyNode & {
  groupLabel: string;
  itemLabel: string;
};

type GeographyCountry = {
  id: string;
  label: string;
  displayName?: string;
  flag?: string;
  center?: [number, number];
  zoom?: number;
  defaultScopeId: string;
  color?: string;
  scopes: GeographyScope[];
};

type GeographyConfig = {
  defaultCountryId: string;
  countries: GeographyCountry[];
};

type BoundaryMeta = {
  dataset: string;
  whereField: string;
  boundaryCode: string;
};

type ScopeRecord = {
  countryId: string;
  countryName: string;
  scopeId: string;
  scopeName: string;
  groupLabel: string;
  itemLabel: string;
  areaCount: number;
  divisionCount: number;
};

type AreaRecord = {
  countryId: string;
  countryName: string;
  scopeId: string;
  scopeName: string;
  areaId: string;
  areaName: string;
  areaDisplayName: string;
  areaGeojsonUrl: string;
  areaDataset: string;
  areaWhereField: string;
  areaBoundaryCode: string;
  divisionCount: number;
};

type DivisionRecord = {
  countryId: string;
  countryName: string;
  scopeId: string;
  scopeName: string;
  groupLabel: string;
  itemLabel: string;
  areaId: string;
  areaName: string;
  areaDisplayName: string;
  areaGeojsonUrl: string;
  areaDataset: string;
  areaWhereField: string;
  areaBoundaryCode: string;
  divisionId: string;
  divisionName: string;
  divisionDisplayName: string;
  divisionGeojsonUrl: string;
  divisionDataset: string;
  divisionWhereField: string;
  divisionBoundaryCode: string;
  directoryPath: string;
  memberName: string;
  memberParty: string;
  memberParliament: string;
  memberChamber: string;
  memberEmail: string;
  memberPhone: string;
  electorateOfficeAddress: string;
  website: string;
  notes: string;
};

const repoRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(repoRoot, 'client', 'public', 'geographies.json');
const exportDir = path.join(repoRoot, 'exports');
const jsonOutputPath = path.join(exportDir, 'parliament-directory.json');
const csvOutputPath = path.join(exportDir, 'parliament-directory.csv');
const summaryOutputPath = path.join(exportDir, 'parliament-directory-summary.json');

function readConfig(filePath: string): GeographyConfig {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as GeographyConfig;
}

function extractBoundaryMeta(geojsonUrl?: string): BoundaryMeta {
  if (!geojsonUrl) {
    return { dataset: '', whereField: '', boundaryCode: '' };
  }

  try {
    const parsedUrl = new URL(geojsonUrl);
    const datasetMatch = parsedUrl.pathname.match(/\/(AUS|STE|CED|SED)\//i);
    const whereClause = parsedUrl.searchParams.get('where') ?? '';
    const whereMatch = whereClause.match(/^([a-z0-9_]+)\s*=\s*'?(.*?)'?$/i);

    return {
      dataset: datasetMatch?.[1]?.toUpperCase() ?? '',
      whereField: whereMatch?.[1] ?? '',
      boundaryCode: whereMatch?.[2] ?? '',
    };
  } catch {
    return { dataset: '', whereField: '', boundaryCode: '' };
  }
}

function csvEscape(value: unknown): string {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows: DivisionRecord[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]) as Array<keyof DivisionRecord>;
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
  ];

  return lines.join('\n');
}

function titleForParliament(scopeId: string, scopeName: string): { memberParliament: string; memberChamber: string } {
  if (scopeId === 'federal') {
    return {
      memberParliament: scopeName,
      memberChamber: 'House of Representatives',
    };
  }

  return {
    memberParliament: scopeName,
    memberChamber: '',
  };
}

function buildDataset(config: GeographyConfig) {
  const requestedCountryIds = (process.env.EXPORT_COUNTRY_IDS ?? 'australia')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  const filteredCountries = config.countries.filter(country =>
    requestedCountryIds.includes(country.id)
  );

  const sourceCountries = filteredCountries.length > 0 ? filteredCountries : config.countries;

  const countries = sourceCountries.map(country => ({
    countryId: country.id,
    countryName: country.displayName ?? country.label,
    defaultScopeId: country.defaultScopeId,
    center: country.center ?? null,
    zoom: country.zoom ?? null,
    color: country.color ?? '',
  }));

  const scopes: ScopeRecord[] = [];
  const areas: AreaRecord[] = [];
  const divisions: DivisionRecord[] = [];

  for (const country of sourceCountries) {
    const countryName = country.displayName ?? country.label;

    for (const scope of country.scopes) {
      const scopeDivisionCount = (scope.children ?? []).reduce(
        (count, area) => count + (area.children?.length ?? 0),
        0
      );

      scopes.push({
        countryId: country.id,
        countryName,
        scopeId: scope.id,
        scopeName: scope.displayName ?? scope.label,
        groupLabel: scope.groupLabel,
        itemLabel: scope.itemLabel,
        areaCount: scope.children?.length ?? 0,
        divisionCount: scopeDivisionCount,
      });

      for (const area of scope.children ?? []) {
        const areaName = area.label;
        const areaDisplayName = area.displayName ?? area.label;
        const areaMeta = extractBoundaryMeta(area.geojsonUrl);

        areas.push({
          countryId: country.id,
          countryName,
          scopeId: scope.id,
          scopeName: scope.displayName ?? scope.label,
          areaId: area.id,
          areaName,
          areaDisplayName,
          areaGeojsonUrl: area.geojsonUrl ?? '',
          areaDataset: areaMeta.dataset,
          areaWhereField: areaMeta.whereField,
          areaBoundaryCode: areaMeta.boundaryCode,
          divisionCount: area.children?.length ?? 0,
        });

        for (const division of area.children ?? []) {
          const divisionDisplayName = division.displayName ?? division.label;
          const divisionMeta = extractBoundaryMeta(division.geojsonUrl);
          const memberDefaults = titleForParliament(scope.id, scope.displayName ?? scope.label);

          divisions.push({
            countryId: country.id,
            countryName,
            scopeId: scope.id,
            scopeName: scope.displayName ?? scope.label,
            groupLabel: scope.groupLabel,
            itemLabel: scope.itemLabel,
            areaId: area.id,
            areaName,
            areaDisplayName,
            areaGeojsonUrl: area.geojsonUrl ?? '',
            areaDataset: areaMeta.dataset,
            areaWhereField: areaMeta.whereField,
            areaBoundaryCode: areaMeta.boundaryCode,
            divisionId: division.id,
            divisionName: division.label,
            divisionDisplayName,
            divisionGeojsonUrl: division.geojsonUrl ?? '',
            divisionDataset: divisionMeta.dataset,
            divisionWhereField: divisionMeta.whereField,
            divisionBoundaryCode: divisionMeta.boundaryCode,
            directoryPath: `/${country.id}/${scope.id}/${area.id}/${division.id}`,
            memberName: '',
            memberParty: '',
            memberParliament: memberDefaults.memberParliament,
            memberChamber: memberDefaults.memberChamber,
            memberEmail: '',
            memberPhone: '',
            electorateOfficeAddress: '',
            website: '',
            notes: '',
          });
        }
      }
    }
  }

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceFile: path.relative(repoRoot, sourcePath),
      defaultCountryId: config.defaultCountryId,
      exportedCountryIds: sourceCountries.map(country => country.id),
      exportFormats: ['json', 'csv'],
    },
    summary: {
      countryCount: countries.length,
      scopeCount: scopes.length,
      areaCount: areas.length,
      divisionCount: divisions.length,
    },
    countries,
    scopes,
    areas,
    divisions,
  };
}

function main() {
  const config = readConfig(sourcePath);
  const dataset = buildDataset(config);

  fs.mkdirSync(exportDir, { recursive: true });
  fs.writeFileSync(jsonOutputPath, `${JSON.stringify(dataset, null, 2)}\n`);
  fs.writeFileSync(csvOutputPath, `${toCsv(dataset.divisions)}\n`);
  fs.writeFileSync(summaryOutputPath, `${JSON.stringify(dataset.summary, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        jsonOutputPath: path.relative(repoRoot, jsonOutputPath),
        csvOutputPath: path.relative(repoRoot, csvOutputPath),
        summaryOutputPath: path.relative(repoRoot, summaryOutputPath),
        ...dataset.summary,
      },
      null,
      2
    )
  );
}

main();
