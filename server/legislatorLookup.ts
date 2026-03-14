/**
 * Legislator Lookup Service
 *
 * Converts a North Carolina address to lat/lng using NC OneMap Geocoding,
 * then determines the NC House and Senate districts using the official
 * NC General Assembly ArcGIS Feature Services (same data source as ncleg.gov),
 * and returns matching legislators from our database.
 *
 * Strategy:
 * 1. Geocode the address using NC OneMap ArcGIS Geocoding Service (Free/Official)
 * 2. Use the geocoded coordinates to query NCGA ArcGIS Feature Services for district boundaries
 * 3. Match districts to legislators stored in our database
 * 4. Cache results for performance
 */

import { getDb } from "./db";
import { legislators, districtLookupCache } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";

// ============================================================================
// Types
// ============================================================================

export interface LegislatorLookupResult {
  success: boolean;
  address: {
    formatted: string;
    lat: number;
    lng: number;
    county: string | null;
    isInNC: boolean;
  };
  houseDistrict: number | null;
  senateDistrict: number | null;
  houseLegislator: LegislatorInfo | null;
  senateLegislator: LegislatorInfo | null;
  error?: string;
}

export interface LegislatorInfo {
  id: number;
  memberId: string;
  chamber: string;
  district: number;
  name: string;
  party: string;
  counties: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  officeRoom: string | null;
}

// ============================================================================
// ArcGIS Service Configuration
// ============================================================================

/**
 * NC OneMap Geocoding Service (Official NC Address Database)
 */
const NCONEMAP_GEOCODE_URL =
  "https://services.nconemap.gov/secure/rest/services/AddressNC/AddressNC_geocoder/GeocodeServer/findAddressCandidates";

/**
 * These are the official NCGA ArcGIS Feature Service URLs used by ncleg.gov
 * for the "Find Your Legislators" tool.
 */
const ARCGIS_HOUSE_URL =
  "https://services5.arcgis.com/gRcZqepTaRC6tVZL/arcgis/rest/services/NCGA_House_2023/FeatureServer/0/query";
const ARCGIS_SENATE_URL =
  "https://services5.arcgis.com/gRcZqepTaRC6tVZL/arcgis/rest/services/NCGA_Senate_2023/FeatureServer/0/query";

// ============================================================================
// Core Lookup Functions
// ============================================================================

/**
 * Main entry point: look up legislators for a given NC address.
 */
export async function lookupLegislatorsByAddress(address: string): Promise<LegislatorLookupResult> {
  // Step 1: Geocode the address
  const geocodeResult = await geocodeAddress(address);

  if (!geocodeResult.success) {
    return {
      success: false,
      address: {
        formatted: address,
        lat: 0,
        lng: 0,
        county: null,
        isInNC: false,
      },
      houseDistrict: null,
      senateDistrict: null,
      houseLegislator: null,
      senateLegislator: null,
      error: geocodeResult.error,
    };
  }

  // Step 2: Verify the address is in North Carolina
  if (!geocodeResult.isInNC) {
    return {
      success: false,
      address: {
        formatted: geocodeResult.formatted,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        county: geocodeResult.county,
        isInNC: false,
      },
      houseDistrict: null,
      senateDistrict: null,
      houseLegislator: null,
      senateLegislator: null,
      error: "The address provided is not in North Carolina. Please enter a North Carolina address.",
    };
  }

  // Step 3: Check cache
  const addressHash = createHash("sha256").update(address.toLowerCase().trim()).digest("hex");
  const cached = await getCachedLookup(addressHash);

  let houseDistrict: number | null = null;
  let senateDistrict: number | null = null;

  if (cached) {
    houseDistrict = cached.ncHouseDistrict;
    senateDistrict = cached.ncSenateDistrict;
    console.log(`[District Lookup] Cache hit: House ${houseDistrict}, Senate ${senateDistrict}`);
  } else {
    // Step 4: Look up districts using ArcGIS Feature Services
    const districts = await lookupDistrictsViaArcGIS(geocodeResult.lat, geocodeResult.lng);
    houseDistrict = districts.houseDistrict;
    senateDistrict = districts.senateDistrict;

    console.log(`[District Lookup] ArcGIS result: House ${houseDistrict}, Senate ${senateDistrict}`);

    // Cache the result
    await cacheDistrictLookup(
      addressHash,
      geocodeResult.formatted,
      geocodeResult.lat,
      geocodeResult.lng,
      houseDistrict,
      senateDistrict,
      geocodeResult.county
    );
  }

  // Step 5: Find legislators by district
  const houseLegislator = houseDistrict ? await findLegislatorByDistrict("H", houseDistrict) : null;
  const senateLegislator = senateDistrict ? await findLegislatorByDistrict("S", senateDistrict) : null;

  return {
    success: true,
    address: {
      formatted: geocodeResult.formatted,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      county: geocodeResult.county,
      isInNC: true,
    },
    houseDistrict,
    senateDistrict,
    houseLegislator,
    senateLegislator,
  };
}

// ============================================================================
// Geocoding (NC OneMap)
// ============================================================================

interface GeocodeAddressResult {
  success: boolean;
  formatted: string;
  lat: number;
  lng: number;
  county: string | null;
  isInNC: boolean;
  error?: string;
}

async function geocodeAddress(address: string): Promise<GeocodeAddressResult> {
  try {
    const params = new URLSearchParams({
      SingleLine: address,
      f: "json",
      outSR: "4326",
      outFields: "Subregion,Region",
      maxLocations: "1",
    });

    const response = await fetch(`${NCONEMAP_GEOCODE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`NC OneMap API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      return {
        success: false,
        formatted: address,
        lat: 0,
        lng: 0,
        county: null,
        isInNC: false,
        error: "Could not find the address. Please check the address and try again.",
      };
    }

    const candidate = data.candidates[0];
    const { x: lng, y: lat } = candidate.location;
    const formatted = candidate.address;
    
    // NC OneMap returns "NC" in Region field for NC addresses
    const region = candidate.attributes?.Region || "";
    const isInNC = region.toUpperCase() === "NC" || region.toUpperCase() === "NORTH CAROLINA";
    const county = candidate.attributes?.Subregion || null;

    return {
      success: true,
      formatted,
      lat,
      lng,
      county,
      isInNC,
    };
  } catch (error) {
    console.error("[Geocoding] Error:", error);
    return {
      success: false,
      formatted: address,
      lat: 0,
      lng: 0,
      county: null,
      isInNC: false,
      error: "Failed to geocode the address. Please try again later.",
    };
  }
}

// ============================================================================
// District Lookup via ArcGIS Feature Services
// ============================================================================

interface DistrictResult {
  houseDistrict: number | null;
  senateDistrict: number | null;
}

async function lookupDistrictsViaArcGIS(lat: number, lng: number): Promise<DistrictResult> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "District",
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "4326",
    f: "json",
    returnGeometry: "false",
  });

  const [houseResult, senateResult] = await Promise.all([
    queryArcGISFeatureService(ARCGIS_HOUSE_URL, params, "House"),
    queryArcGISFeatureService(ARCGIS_SENATE_URL, params, "Senate"),
  ]);

  return {
    houseDistrict: houseResult,
    senateDistrict: senateResult,
  };
}

async function queryArcGISFeatureService(
  baseUrl: string,
  params: URLSearchParams,
  label: string
): Promise<number | null> {
  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].attributes.District;
    }
  } catch (error) {
    console.error(`[ArcGIS ${label}] Error:`, error);
  }
  return null;
}

// ============================================================================
// Database Helpers
// ============================================================================

async function getCachedLookup(addressHash: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(districtLookupCache)
    .where(eq(districtLookupCache.addressHash, addressHash))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

async function cacheDistrictLookup(
  addressHash: string,
  normalizedAddress: string,
  lat: number,
  lng: number,
  houseDistrict: number | null,
  senateDistrict: number | null,
  county: string | null
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(districtLookupCache).values({
      addressHash,
      normalizedAddress,
      latitude: String(lat),
      longitude: String(lng),
      ncHouseDistrict: houseDistrict,
      ncSenateDistrict: senateDistrict,
      county,
    });
  } catch (error) {
    console.error("[Database] Failed to cache lookup:", error);
  }
}

async function findLegislatorByDistrict(chamber: "H" | "S", district: number): Promise<LegislatorInfo | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(legislators)
    .where(
      and(
        eq(legislators.chamber, chamber),
        eq(legislators.district, district),
        eq(legislators.isActive, true)
      )
    )
    .limit(1);

  return results.length > 0 ? (results[0] as LegislatorInfo) : null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
