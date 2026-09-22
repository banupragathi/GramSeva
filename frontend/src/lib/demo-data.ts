import { FeatureCollection, Feature, Polygon, Point } from "geojson";

/* ------------------------------------------------------------------ */
/*  DEMO PARCELS — Realistic irregular parcels around a fictional      */
/*  Indian peri-urban area (coordinates near Tamil Nadu region)         */
/* ------------------------------------------------------------------ */

interface ParcelProperties {
  id: string;
  survey_number: string;
  area_sqm: number;
  land_use: string;
  building_count: number;
  building_area_sqm: number;
  road_access: boolean;
  confidence: number;
  match_state: "MATCHED" | "LIKELY_MATCH" | "REVIEW_REQUIRED" | "NOT_MATCHED";
  sources: string[];
  has_conflict: boolean;
  conflict_types: string[];
  has_change: boolean;
  change_types: string[];
  review_state: "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | null;
  owner_name: string;
  last_updated: string;
}

// Base center point — near Tamil Nadu plains
const BASE_LNG = 79.85;
const BASE_LAT = 12.97;

function parcel(
  id: string,
  coords: number[][],
  props: Partial<ParcelProperties>
): Feature<Polygon, ParcelProperties> {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[...coords, coords[0]]],
    },
    properties: {
      id,
      survey_number: props.survey_number || `SN-${id}`,
      area_sqm: props.area_sqm || 500,
      land_use: props.land_use || "Residential",
      building_count: props.building_count || 0,
      building_area_sqm: props.building_area_sqm || 0,
      road_access: props.road_access ?? true,
      confidence: props.confidence || 90,
      match_state: props.match_state || "MATCHED",
      sources: props.sources || ["Cadastral", "Municipal"],
      has_conflict: props.has_conflict || false,
      conflict_types: props.conflict_types || [],
      has_change: props.has_change || false,
      change_types: props.change_types || [],
      review_state: props.review_state || null,
      owner_name: props.owner_name || "—",
      last_updated: props.last_updated || "2024-06-15",
    },
  };
}

export const demoParcels: FeatureCollection<Polygon, ParcelProperties> = {
  type: "FeatureCollection",
  features: [
    // Row 1 — Main settlement area
    parcel("TN-1001", [
      [BASE_LNG, BASE_LAT],
      [BASE_LNG + 0.003, BASE_LAT + 0.0005],
      [BASE_LNG + 0.0032, BASE_LAT + 0.003],
      [BASE_LNG + 0.0002, BASE_LAT + 0.0028],
    ], {
      survey_number: "SN-1001",
      area_sqm: 1200,
      land_use: "Residential",
      building_count: 2,
      building_area_sqm: 420,
      confidence: 96,
      sources: ["Cadastral", "Municipal", "Drone"],
      owner_name: "Suresh Kumar",
    }),

    parcel("TN-1002", [
      [BASE_LNG + 0.003, BASE_LAT + 0.0005],
      [BASE_LNG + 0.006, BASE_LAT],
      [BASE_LNG + 0.0062, BASE_LAT + 0.003],
      [BASE_LNG + 0.0032, BASE_LAT + 0.003],
    ], {
      survey_number: "SN-1002",
      area_sqm: 980,
      land_use: "Residential",
      building_count: 1,
      building_area_sqm: 280,
      confidence: 92,
      sources: ["Cadastral", "Municipal"],
      owner_name: "Lakshmi Devi",
    }),

    parcel("TN-1003", [
      [BASE_LNG + 0.006, BASE_LAT],
      [BASE_LNG + 0.0095, BASE_LAT + 0.0008],
      [BASE_LNG + 0.01, BASE_LAT + 0.0035],
      [BASE_LNG + 0.0062, BASE_LAT + 0.003],
    ], {
      survey_number: "SN-1003",
      area_sqm: 1100,
      land_use: "Commercial",
      building_count: 1,
      building_area_sqm: 560,
      confidence: 88,
      match_state: "LIKELY_MATCH",
      sources: ["Cadastral", "Municipal", "Revenue"],
      owner_name: "Rajan Traders",
    }),

    // Row 2 — Mixed area
    parcel("TN-1010", [
      [BASE_LNG + 0.0002, BASE_LAT + 0.0032],
      [BASE_LNG + 0.0032, BASE_LAT + 0.003],
      [BASE_LNG + 0.0035, BASE_LAT + 0.006],
      [BASE_LNG, BASE_LAT + 0.0062],
    ], {
      survey_number: "SN-1010",
      area_sqm: 1500,
      land_use: "Agricultural",
      building_count: 0,
      building_area_sqm: 0,
      confidence: 94,
      sources: ["Revenue", "Cadastral"],
      owner_name: "Murugan S.",
    }),

    parcel("TN-1011", [
      [BASE_LNG + 0.0032, BASE_LAT + 0.003],
      [BASE_LNG + 0.0062, BASE_LAT + 0.003],
      [BASE_LNG + 0.006, BASE_LAT + 0.0065],
      [BASE_LNG + 0.0035, BASE_LAT + 0.006],
    ], {
      survey_number: "SN-1011",
      area_sqm: 870,
      land_use: "Residential",
      building_count: 1,
      building_area_sqm: 190,
      confidence: 78,
      match_state: "REVIEW_REQUIRED",
      sources: ["Cadastral", "Municipal"],
      has_conflict: true,
      conflict_types: ["boundary", "area"],
      review_state: "PENDING",
      owner_name: "Priya M.",
    }),

    parcel("TN-1012", [
      [BASE_LNG + 0.0062, BASE_LAT + 0.003],
      [BASE_LNG + 0.01, BASE_LAT + 0.0035],
      [BASE_LNG + 0.0098, BASE_LAT + 0.0068],
      [BASE_LNG + 0.006, BASE_LAT + 0.0065],
    ], {
      survey_number: "SN-1012",
      area_sqm: 1340,
      land_use: "Residential",
      building_count: 3,
      building_area_sqm: 680,
      confidence: 91,
      sources: ["Cadastral", "Municipal", "Drone", "Revenue"],
      owner_name: "Anand R.",
    }),

    // Row 3 — Southern parcels
    parcel("TN-1020", [
      [BASE_LNG, BASE_LAT + 0.0062],
      [BASE_LNG + 0.0035, BASE_LAT + 0.006],
      [BASE_LNG + 0.004, BASE_LAT + 0.009],
      [BASE_LNG + 0.0005, BASE_LAT + 0.0095],
    ], {
      survey_number: "SN-1020",
      area_sqm: 2200,
      land_use: "Agricultural",
      building_count: 1,
      building_area_sqm: 80,
      confidence: 97,
      sources: ["Revenue", "Cadastral", "Drone"],
      has_change: true,
      change_types: ["new_building"],
      owner_name: "Selvam K.",
    }),

    parcel("TN-1021", [
      [BASE_LNG + 0.0035, BASE_LAT + 0.006],
      [BASE_LNG + 0.006, BASE_LAT + 0.0065],
      [BASE_LNG + 0.0065, BASE_LAT + 0.0092],
      [BASE_LNG + 0.004, BASE_LAT + 0.009],
    ], {
      survey_number: "SN-1021",
      area_sqm: 780,
      land_use: "Residential",
      building_count: 1,
      building_area_sqm: 210,
      confidence: 85,
      match_state: "LIKELY_MATCH",
      sources: ["Cadastral", "Municipal"],
      has_conflict: true,
      conflict_types: ["attribute"],
      owner_name: "Kavitha P.",
    }),

    parcel("TN-1022", [
      [BASE_LNG + 0.006, BASE_LAT + 0.0065],
      [BASE_LNG + 0.0098, BASE_LAT + 0.0068],
      [BASE_LNG + 0.0095, BASE_LAT + 0.0098],
      [BASE_LNG + 0.0065, BASE_LAT + 0.0092],
    ], {
      survey_number: "SN-1022",
      area_sqm: 1050,
      land_use: "Mixed",
      building_count: 2,
      building_area_sqm: 450,
      confidence: 72,
      match_state: "REVIEW_REQUIRED",
      sources: ["Cadastral", "Municipal", "Revenue"],
      has_conflict: true,
      conflict_types: ["boundary", "attribute", "area"],
      review_state: "PENDING",
      owner_name: "Gopal Enterprises",
    }),

    // Larger agricultural parcel to the east
    parcel("TN-1030", [
      [BASE_LNG + 0.01, BASE_LAT + 0.0035],
      [BASE_LNG + 0.015, BASE_LAT + 0.002],
      [BASE_LNG + 0.016, BASE_LAT + 0.007],
      [BASE_LNG + 0.0098, BASE_LAT + 0.0068],
    ], {
      survey_number: "SN-1030",
      area_sqm: 3500,
      land_use: "Agricultural",
      building_count: 0,
      building_area_sqm: 0,
      confidence: 94,
      sources: ["Revenue", "Cadastral"],
      has_change: true,
      change_types: ["land_use_change"],
      owner_name: "Mani S.",
    }),

    parcel("TN-1031", [
      [BASE_LNG + 0.015, BASE_LAT + 0.002],
      [BASE_LNG + 0.019, BASE_LAT + 0.001],
      [BASE_LNG + 0.02, BASE_LAT + 0.006],
      [BASE_LNG + 0.016, BASE_LAT + 0.007],
    ], {
      survey_number: "SN-1031",
      area_sqm: 2800,
      land_use: "Agricultural",
      building_count: 0,
      building_area_sqm: 0,
      confidence: 96,
      sources: ["Revenue", "Drone"],
      owner_name: "Arjun Farms",
    }),

    // Northern parcels
    parcel("TN-1040", [
      [BASE_LNG + 0.001, BASE_LAT - 0.003],
      [BASE_LNG + 0.005, BASE_LAT - 0.0032],
      [BASE_LNG + 0.0048, BASE_LAT + 0.0002],
      [BASE_LNG, BASE_LAT],
    ], {
      survey_number: "SN-1040",
      area_sqm: 1600,
      land_use: "Residential",
      building_count: 2,
      building_area_sqm: 540,
      confidence: 93,
      sources: ["Cadastral", "Municipal", "Revenue"],
      owner_name: "Vignesh T.",
    }),

    parcel("TN-1041", [
      [BASE_LNG + 0.005, BASE_LAT - 0.0032],
      [BASE_LNG + 0.009, BASE_LAT - 0.003],
      [BASE_LNG + 0.0095, BASE_LAT + 0.0008],
      [BASE_LNG + 0.006, BASE_LAT],
    ], {
      survey_number: "SN-1041",
      area_sqm: 1400,
      land_use: "Institutional",
      building_count: 1,
      building_area_sqm: 800,
      confidence: 98,
      sources: ["Cadastral", "Municipal", "Revenue", "Drone"],
      owner_name: "Govt. Primary School",
    }),

    // KEY PARCEL — TN-1042 (featured in spec)
    parcel("TN-1042", [
      [BASE_LNG + 0.009, BASE_LAT - 0.003],
      [BASE_LNG + 0.014, BASE_LAT - 0.0035],
      [BASE_LNG + 0.015, BASE_LAT + 0.002],
      [BASE_LNG + 0.0095, BASE_LAT + 0.0008],
    ], {
      survey_number: "SN-1042",
      area_sqm: 1200,
      land_use: "Residential",
      building_count: 1,
      building_area_sqm: 340,
      confidence: 94,
      match_state: "MATCHED",
      sources: ["Cadastral", "Municipal", "Drone", "Revenue"],
      has_conflict: true,
      conflict_types: ["area"],
      has_change: true,
      change_types: ["building_expanded"],
      owner_name: "S. Kumar",
      last_updated: "2024-08-22",
    }),
  ],
};

/* ------------------------------------------------------------------ */
/*  DEMO BUILDINGS                                                      */
/* ------------------------------------------------------------------ */
interface BuildingProperties {
  id: string;
  parcel_id: string;
  area_sqm: number;
  floors: number;
  type: string;
  year_built: number;
}

export const demoBuildings: FeatureCollection<Polygon, BuildingProperties> = {
  type: "FeatureCollection",
  features: [
    // Buildings in TN-1001
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [BASE_LNG + 0.0008, BASE_LAT + 0.001],
          [BASE_LNG + 0.002, BASE_LAT + 0.001],
          [BASE_LNG + 0.002, BASE_LAT + 0.002],
          [BASE_LNG + 0.0008, BASE_LAT + 0.002],
          [BASE_LNG + 0.0008, BASE_LAT + 0.001],
        ]],
      },
      properties: { id: "B-1001-A", parcel_id: "TN-1001", area_sqm: 180, floors: 2, type: "Residential", year_built: 2018 },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [BASE_LNG + 0.0022, BASE_LAT + 0.0015],
          [BASE_LNG + 0.0028, BASE_LAT + 0.0015],
          [BASE_LNG + 0.0028, BASE_LAT + 0.0025],
          [BASE_LNG + 0.0022, BASE_LAT + 0.0025],
          [BASE_LNG + 0.0022, BASE_LAT + 0.0015],
        ]],
      },
      properties: { id: "B-1001-B", parcel_id: "TN-1001", area_sqm: 240, floors: 1, type: "Residential", year_built: 2020 },
    },
    // Building in TN-1002
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [BASE_LNG + 0.004, BASE_LAT + 0.0012],
          [BASE_LNG + 0.0055, BASE_LAT + 0.0012],
          [BASE_LNG + 0.0055, BASE_LAT + 0.0024],
          [BASE_LNG + 0.004, BASE_LAT + 0.0024],
          [BASE_LNG + 0.004, BASE_LAT + 0.0012],
        ]],
      },
      properties: { id: "B-1002-A", parcel_id: "TN-1002", area_sqm: 280, floors: 2, type: "Residential", year_built: 2019 },
    },
    // Building in TN-1042 (featured)
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [BASE_LNG + 0.0105, BASE_LAT - 0.002],
          [BASE_LNG + 0.013, BASE_LAT - 0.002],
          [BASE_LNG + 0.013, BASE_LAT - 0.0005],
          [BASE_LNG + 0.0105, BASE_LAT - 0.0005],
          [BASE_LNG + 0.0105, BASE_LAT - 0.002],
        ]],
      },
      properties: { id: "B-1042-A", parcel_id: "TN-1042", area_sqm: 340, floors: 2, type: "Residential", year_built: 2021 },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  DEMO ROADS                                                          */
/* ------------------------------------------------------------------ */
export const demoRoads: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // Main east-west road
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [BASE_LNG - 0.002, BASE_LAT + 0.003],
          [BASE_LNG + 0.005, BASE_LAT + 0.003],
          [BASE_LNG + 0.01, BASE_LAT + 0.0035],
          [BASE_LNG + 0.022, BASE_LAT + 0.003],
        ],
      },
      properties: { id: "R-001", name: "Main Road", type: "secondary", width: 8 },
    },
    // North-south road
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [BASE_LNG + 0.006, BASE_LAT - 0.004],
          [BASE_LNG + 0.006, BASE_LAT],
          [BASE_LNG + 0.0062, BASE_LAT + 0.003],
          [BASE_LNG + 0.006, BASE_LAT + 0.0065],
          [BASE_LNG + 0.0065, BASE_LAT + 0.0092],
          [BASE_LNG + 0.006, BASE_LAT + 0.012],
        ],
      },
      properties: { id: "R-002", name: "Village Road", type: "tertiary", width: 5 },
    },
    // Access road
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [BASE_LNG - 0.001, BASE_LAT],
          [BASE_LNG + 0.003, BASE_LAT + 0.0005],
          [BASE_LNG + 0.006, BASE_LAT],
          [BASE_LNG + 0.0095, BASE_LAT + 0.0008],
          [BASE_LNG + 0.015, BASE_LAT + 0.002],
        ],
      },
      properties: { id: "R-003", name: "Access Lane", type: "service", width: 3 },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  DEMO CONFLICTS                                                      */
/* ------------------------------------------------------------------ */
export interface DemoConflict {
  id: string;
  parcel_id: string;
  type: "boundary" | "area" | "attribute" | "temporal" | "topology";
  severity: "high" | "medium" | "low";
  description: string;
  source_a: { name: string; value: string };
  source_b: { name: string; value: string };
  difference: string;
  state: "OPEN" | "AUTO_RESOLVE" | "HUMAN_REVIEW" | "IRRECONCILABLE" | "RESOLVED";
  created_at: string;
}

export const demoConflicts: DemoConflict[] = [
  {
    id: "C-001",
    parcel_id: "TN-1042",
    type: "area",
    severity: "medium",
    description: "Area mismatch between cadastral and municipal records",
    source_a: { name: "Cadastral", value: "1200 sq.ft" },
    source_b: { name: "Municipal", value: "1267 sq.ft" },
    difference: "5.58%",
    state: "HUMAN_REVIEW",
    created_at: "2024-08-20T09:51:00Z",
  },
  {
    id: "C-002",
    parcel_id: "TN-1011",
    type: "boundary",
    severity: "high",
    description: "Boundary mismatch — cadastral boundary overlaps adjacent parcel in municipal GIS",
    source_a: { name: "Cadastral", value: "Original boundary" },
    source_b: { name: "Municipal", value: "Shifted 2.3m east" },
    difference: "2.3m offset",
    state: "OPEN",
    created_at: "2024-08-18T14:22:00Z",
  },
  {
    id: "C-003",
    parcel_id: "TN-1011",
    type: "area",
    severity: "medium",
    description: "Area difference due to boundary shift",
    source_a: { name: "Cadastral", value: "870 sq.m" },
    source_b: { name: "Municipal", value: "912 sq.m" },
    difference: "4.83%",
    state: "OPEN",
    created_at: "2024-08-18T14:22:00Z",
  },
  {
    id: "C-004",
    parcel_id: "TN-1021",
    type: "attribute",
    severity: "low",
    description: "Land use classification mismatch",
    source_a: { name: "Revenue", value: "Agricultural" },
    source_b: { name: "Municipal", value: "Residential" },
    difference: "Different classification",
    state: "HUMAN_REVIEW",
    created_at: "2024-08-15T11:30:00Z",
  },
  {
    id: "C-005",
    parcel_id: "TN-1022",
    type: "boundary",
    severity: "high",
    description: "Three-source boundary disagreement",
    source_a: { name: "Cadastral", value: "Original boundary" },
    source_b: { name: "Revenue", value: "Larger extent" },
    difference: "Multi-source inconsistency",
    state: "OPEN",
    created_at: "2024-08-12T08:45:00Z",
  },
  {
    id: "C-006",
    parcel_id: "TN-1022",
    type: "attribute",
    severity: "medium",
    description: "Land use — Cadastral says Mixed, Revenue says Commercial",
    source_a: { name: "Cadastral", value: "Mixed" },
    source_b: { name: "Revenue", value: "Commercial" },
    difference: "Classification conflict",
    state: "OPEN",
    created_at: "2024-08-12T08:45:00Z",
  },
  {
    id: "C-007",
    parcel_id: "TN-1022",
    type: "area",
    severity: "high",
    description: "Significant area mismatch across three sources",
    source_a: { name: "Cadastral", value: "1050 sq.m" },
    source_b: { name: "Revenue", value: "1180 sq.m" },
    difference: "12.38%",
    state: "OPEN",
    created_at: "2024-08-12T08:45:00Z",
  },
];

/* ------------------------------------------------------------------ */
/*  DEMO CHANGES                                                        */
/* ------------------------------------------------------------------ */
export interface DemoChange {
  id: string;
  parcel_id: string;
  type: "new_building" | "building_expanded" | "building_demolished" | "boundary_change" | "land_use_change";
  description: string;
  before_date: string;
  after_date: string;
  before_value: string;
  after_value: string;
  confidence: number;
  detected_by: string;
}

export const demoChanges: DemoChange[] = [
  {
    id: "CH-001",
    parcel_id: "TN-1020",
    type: "new_building",
    description: "New building detected in agricultural parcel",
    before_date: "2022-03-15",
    after_date: "2024-06-10",
    before_value: "Vacant land",
    after_value: "80 sq.m structure detected",
    confidence: 91,
    detected_by: "ChangeFormer",
  },
  {
    id: "CH-002",
    parcel_id: "TN-1042",
    type: "building_expanded",
    description: "Building expansion detected",
    before_date: "2021-09-01",
    after_date: "2024-08-22",
    before_value: "260 sq.m",
    after_value: "340 sq.m (30.7% larger)",
    confidence: 88,
    detected_by: "ChangeFormer",
  },
  {
    id: "CH-003",
    parcel_id: "TN-1030",
    type: "land_use_change",
    description: "Partial conversion from agricultural to residential",
    before_date: "2019-01-01",
    after_date: "2024-06-15",
    before_value: "100% Agricultural",
    after_value: "Mixed — partial residential activity",
    confidence: 82,
    detected_by: "SegFormer-B2 + ChangeFormer",
  },
];

/* ------------------------------------------------------------------ */
/*  DEMO MATCH EVIDENCE                                                 */
/* ------------------------------------------------------------------ */
export interface MatchEvidence {
  parcel_id: string;
  overall_confidence: number;
  spatial_match: number;
  geometry_match: number;
  visual_match: number;
  attribute_match: number;
  temporal_consistency: number;
  reasons: string[];
  sources_compared: string[];
}

export const demoMatchEvidence: Record<string, MatchEvidence> = {
  "TN-1042": {
    parcel_id: "TN-1042",
    overall_confidence: 94,
    spatial_match: 97,
    geometry_match: 95,
    visual_match: 92,
    attribute_match: 96,
    temporal_consistency: 91,
    reasons: [
      "High polygon overlap (IoU > 0.92)",
      "Similar building geometry across drone and cadastral",
      "Strong attribute similarity (survey number, area)",
      "Small area difference (5.58%)",
      "Temporal consistency across 2019-2024 records",
    ],
    sources_compared: ["Cadastral", "Municipal", "Drone", "Revenue"],
  },
  "TN-1001": {
    parcel_id: "TN-1001",
    overall_confidence: 96,
    spatial_match: 98,
    geometry_match: 97,
    visual_match: 94,
    attribute_match: 95,
    temporal_consistency: 96,
    reasons: [
      "Near-perfect polygon overlap",
      "Building footprints match across sources",
      "Consistent survey number and area",
      "No significant temporal changes",
    ],
    sources_compared: ["Cadastral", "Municipal", "Drone"],
  },
  "TN-1022": {
    parcel_id: "TN-1022",
    overall_confidence: 72,
    spatial_match: 78,
    geometry_match: 70,
    visual_match: 75,
    attribute_match: 62,
    temporal_consistency: 80,
    reasons: [
      "Moderate polygon overlap — boundary disagreement",
      "Area mismatch exceeds 10%",
      "Land use classification differs between sources",
      "Building geometry partially matches",
    ],
    sources_compared: ["Cadastral", "Municipal", "Revenue"],
  },
};

/* ------------------------------------------------------------------ */
/*  DEMO DATASETS                                                       */
/* ------------------------------------------------------------------ */
export interface DemoDataset {
  id: string;
  name: string;
  source_type: string;
  format: string;
  record_count: number;
  geometry_type: string;
  original_crs: string;
  normalized_crs: string;
  status: "ready" | "processing" | "validating" | "error";
  uploaded_at: string;
  file_size: string;
  validity: number;
  missing_attributes: number;
  duplicates: number;
}

export const demoDatasets: DemoDataset[] = [
  {
    id: "DS-001",
    name: "cadastral_tn_2024.geojson",
    source_type: "Cadastral",
    format: "GeoJSON",
    record_count: 487,
    geometry_type: "Polygon",
    original_crs: "EPSG:32644",
    normalized_crs: "EPSG:4326",
    status: "ready",
    uploaded_at: "2024-08-15T09:42:00Z",
    file_size: "4.2 MB",
    validity: 98.2,
    missing_attributes: 3,
    duplicates: 0,
  },
  {
    id: "DS-002",
    name: "municipal_gis_export.shp",
    source_type: "Municipal GIS",
    format: "Shapefile",
    record_count: 523,
    geometry_type: "Polygon",
    original_crs: "EPSG:4326",
    normalized_crs: "EPSG:4326",
    status: "ready",
    uploaded_at: "2024-08-12T14:20:00Z",
    file_size: "6.8 MB",
    validity: 95.7,
    missing_attributes: 12,
    duplicates: 2,
  },
  {
    id: "DS-003",
    name: "drone_survey_aug24.geotiff",
    source_type: "Drone Imagery",
    format: "GeoTIFF",
    record_count: 1,
    geometry_type: "Raster",
    original_crs: "EPSG:32644",
    normalized_crs: "EPSG:4326",
    status: "ready",
    uploaded_at: "2024-08-10T11:15:00Z",
    file_size: "234 MB",
    validity: 100,
    missing_attributes: 0,
    duplicates: 0,
  },
  {
    id: "DS-004",
    name: "revenue_records.csv",
    source_type: "Revenue Records",
    format: "CSV",
    record_count: 412,
    geometry_type: "None (tabular)",
    original_crs: "N/A",
    normalized_crs: "N/A",
    status: "ready",
    uploaded_at: "2024-08-08T16:30:00Z",
    file_size: "1.1 MB",
    validity: 89.4,
    missing_attributes: 28,
    duplicates: 5,
  },
  {
    id: "DS-005",
    name: "osm_buildings_tn.geojson",
    source_type: "OpenStreetMap",
    format: "GeoJSON",
    record_count: 1892,
    geometry_type: "Polygon",
    original_crs: "EPSG:4326",
    normalized_crs: "EPSG:4326",
    status: "ready",
    uploaded_at: "2024-08-05T08:00:00Z",
    file_size: "12.4 MB",
    validity: 97.1,
    missing_attributes: 145,
    duplicates: 18,
  },
  {
    id: "DS-006",
    name: "gnss_control_points.csv",
    source_type: "GNSS / CORS",
    format: "CSV",
    record_count: 34,
    geometry_type: "Point",
    original_crs: "EPSG:4326",
    normalized_crs: "EPSG:4326",
    status: "ready",
    uploaded_at: "2024-08-01T10:45:00Z",
    file_size: "48 KB",
    validity: 100,
    missing_attributes: 0,
    duplicates: 0,
  },
];

export type { ParcelProperties, BuildingProperties };
