/**
 * Legislator Lookup Service
 *
 * Converts a North Carolina address to lat/lng using Google Maps Geocoding,
 * then determines the NC House and Senate districts using the official
 * NC General Assembly ArcGIS Feature Services (same data source as ncleg.gov),
 * and returns matching legislators from our database.
 *
 * Strategy:
 * 1. Geocode the address using Google Maps API (via Manus proxy)
 * 2. Use the geocoded coordinates to query NCGA ArcGIS Feature Services for district boundaries
 * 3. Match districts to legislators stored in our database
 * 4. Cache results for performance
 */

import { makeRequest, type GeocodingResult } from "./_core/map";
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
// ArcGIS Feature Service Configuration
// ============================================================================

/**
 * These are the official NCGA ArcGIS Feature Service URLs used by ncleg.gov
 * for the "Find Your Legislators" tool. The portal item IDs are sourced from
 * the ncleg.gov FindYourLegislators page's LAYER_IDS configuration.
 *
 * Portal items resolve to these Feature Service URLs:
 * - House: 8a50635c58914c3aa60e1d578685a27a → NCGA_House_2023
 * - Senate: efdeebfe3bfe44ba90766891fd71fd90 → NCGA_Senate_2023
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
// Geocoding
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
    const result = await makeRequest<GeocodingResult>("/maps/api/geocode/json", {
      address: address,
      components: "country:US",
    });

    if (result.status !== "OK" || !result.results || result.results.length === 0) {
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

    const firstResult = result.results[0];
    const { lat, lng } = firstResult.geometry.location;
    const formatted = firstResult.formatted_address;

    // Check if address is in North Carolina
    let isInNC = false;
    let county: string | null = null;

    for (const component of firstResult.address_components) {
      if (component.types.includes("administrative_area_level_1")) {
        isInNC = component.short_name === "NC" || component.long_name === "North Carolina";
      }
      if (component.types.includes("administrative_area_level_2")) {
        county = component.long_name.replace(" County", "");
      }
    }

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

/**
 * Query the official NCGA ArcGIS Feature Services to determine which
 * NC House and Senate districts contain the given coordinates.
 *
 * These are the same services used by ncleg.gov's "Find Your Legislators" tool.
 * The query performs a spatial intersection: given a point (lat/lng),
 * it returns the district polygon that contains that point.
 */
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

  // Query sequentially to avoid overwhelming the ArcGIS CDN
  // (parallel requests from this sandbox sometimes cause connection drops)
  const houseResult = await queryArcGISFeatureService(ARCGIS_HOUSE_URL, params, "House");
  // Small delay between requests to avoid connection issues
  await delay(500);
  const senateResult = await queryArcGISFeatureService(ARCGIS_SENATE_URL, params, "Senate");

  return {
    houseDistrict: houseResult,
    senateDistrict: senateResult,
  };
}

/**
 * Query a single ArcGIS Feature Service with retry logic.
 * Returns the district number or null if the query fails.
 */
async function queryArcGISFeatureService(
  baseUrl: string,
  params: URLSearchParams,
  label: string
): Promise<number | null> {
  const url = `${baseUrl}?${params.toString()}`;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      // Use undici-compatible fetch options; the ArcGIS CDN sometimes
      // drops HTTP/2 connections from this sandbox, so we add a
      // cache-busting param per attempt to avoid stale connections.
      const cacheBuster = `_cb=${Date.now()}_${attempt}`;
      const fetchUrl = `${url}&${cacheBuster}`;

      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "Connection": "keep-alive",
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`[ArcGIS ${label}] HTTP ${response.status} on attempt ${attempt}`);
        if (attempt < maxRetries) {
          await delay(2000 * attempt);
          continue;
        }
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.warn(`[ArcGIS ${label}] API error:`, data.error.message);
        if (attempt < maxRetries) {
          await delay(2000 * attempt);
          continue;
        }
        return null;
      }

      if (data.features && data.features.length > 0) {
        const district = data.features[0].attributes?.District;
        if (typeof district === "number") {
          console.log(`[ArcGIS ${label}] District ${district} found on attempt ${attempt}`);
          return district;
        }
      }

      console.warn(`[ArcGIS ${label}] No features returned for coordinates`);
      return null;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.warn(`[ArcGIS ${label}] Request timed out on attempt ${attempt}`);
      } else {
        console.warn(`[ArcGIS ${label}] Error on attempt ${attempt}:`, error.message);
      }
      if (attempt < maxRetries) {
        await delay(2000 * attempt);
        continue;
      }
      return null;
    }
  }

  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Database Operations
// ============================================================================

async function getCachedLookup(addressHash: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(districtLookupCache)
      .where(eq(districtLookupCache.addressHash, addressHash))
      .limit(1);

    if (result.length > 0) {
      // Check if cache is less than 30 days old
      const cacheAge = Date.now() - result[0].createdAt.getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (cacheAge < thirtyDays) {
        return result[0];
      }
    }
    return null;
  } catch (error) {
    console.error("[Cache] Error reading cache:", error);
    return null;
  }
}

async function cacheDistrictLookup(
  addressHash: string,
  normalizedAddress: string,
  lat: number,
  lng: number,
  ncHouseDistrict: number | null,
  ncSenateDistrict: number | null,
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
      ncHouseDistrict,
      ncSenateDistrict,
      county,
    }).onDuplicateKeyUpdate({
      set: {
        normalizedAddress,
        latitude: String(lat),
        longitude: String(lng),
        ncHouseDistrict,
        ncSenateDistrict,
        county,
      },
    });
  } catch (error) {
    console.error("[Cache] Error writing cache:", error);
  }
}

async function findLegislatorByDistrict(chamber: "H" | "S", district: number): Promise<LegislatorInfo | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
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

    if (result.length > 0) {
      const leg = result[0];
      return {
        id: leg.id,
        memberId: leg.memberId,
        chamber: leg.chamber,
        district: leg.district,
        name: leg.name,
        party: leg.party,
        counties: leg.counties,
        email: leg.email,
        phone: leg.phone,
        photoUrl: leg.photoUrl,
        officeRoom: leg.officeRoom,
      };
    }
    return null;
  } catch (error) {
    console.error("[Legislator Lookup] Error:", error);
    return null;
  }
}
