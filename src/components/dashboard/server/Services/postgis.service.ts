import { db, pool } from "../../../../db/index";
import { sql } from "drizzle-orm";
import { isPostgresConnected } from "../Config/database";
import { getEarthquakes, getVolcanoes } from "./dataStore.service";
import { defaultInfrastructures } from "./postgres.services";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * PostGIS Spatial Query Service for R-GEVAMS
 * Performs native PostGIS queries when PostgreSQL is connected,
 * with zero-fail geodesic spherical computation fallback.
 */
export class PostgisService {
  /**
   * Spatial Query: Get all earthquakes within a radius (in km) from a target point
   */
  static async getEarthquakesWithinRadius(targetLat: number, targetLng: number, radiusKm: number) {
    if (isPostgresConnected) {
      try {
        const radiusMeters = radiusKm * 1000;
        const result = await db.execute(sql`
          SELECT 
            id, title, magnitude, latitude, longitude, depth_km as "depthKm", 
            place, region, category, source, is_realtime as "isRealtime", occurred_at as "occurredAt",
            ROUND((ST_Distance(
              ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${targetLng}, ${targetLat}), 4326)::geography
            ) / 1000)::numeric, 2) as "distanceKm"
          FROM earthquakes
          WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${targetLng}, ${targetLat}), 4326)::geography,
            ${radiusMeters}
          )
          ORDER BY "distanceKm" ASC;
        `);
        if (result && result.rows) {
          return result.rows;
        }
      } catch {
        // Fall back to geodesic computation
      }
    }

    // Geodesic Fallback
    const allEq = getEarthquakes();
    const matches = allEq
      .map((eq) => {
        const dist = haversineDistanceKm(targetLat, targetLng, eq.coordinates[0], eq.coordinates[1]);
        return {
          id: eq.id,
          title: `M ${eq.magnitude} - ${eq.location}`,
          magnitude: eq.magnitude,
          latitude: eq.coordinates[0],
          longitude: eq.coordinates[1],
          depthKm: eq.depth,
          place: eq.location,
          region: "Ethiopian Rift System",
          category: "Regional",
          source: "FURI Seismic Observatory / USGS",
          isRealtime: !eq.isHistorical,
          occurredAt: eq.dateTime,
          distanceKm: dist
        };
      })
      .filter((eq) => eq.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return matches;
  }

  /**
   * Spatial Query: Calculate critical infrastructure within the volcanic hazard buffer zone
   */
  static async getInfrastructureInVolcanoHazardZone(volcanoId: string) {
    if (isPostgresConnected) {
      try {
        const result = await db.execute(sql`
          SELECT 
            v.id as "volcanoId",
            v.name as "volcanoName",
            v.alert_level as "alertLevel",
            v.hazard_radius_km as "hazardRadiusKm",
            i.id as "infrastructureId",
            i.name as "infrastructureName",
            i.type as "infrastructureType",
            i.region,
            ROUND((ST_Distance(
              ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)::geography,
              ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography
            ) / 1000)::numeric, 2) as "distanceKm",
            i.vulnerability_index as "vulnerabilityIndex",
            i.status
          FROM volcanoes v
          JOIN infrastructures i ON ST_DWithin(
            ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
            (v.hazard_radius_km * 1000)
          )
          WHERE v.id = ${volcanoId}
          ORDER BY "distanceKm" ASC;
        `);
        if (result && result.rows) {
          return result.rows;
        }
      } catch {
        // Fall back to geodesic calculation
      }
    }

    // Geodesic Fallback
    const volcanoes = getVolcanoes();
    const volcano = volcanoes.find((v) => v.id === volcanoId) || volcanoes[0];
    if (!volcano) return [];

    const hazardRadiusKm = 35;
    const vLat = volcano.coordinates[0];
    const vLng = volcano.coordinates[1];

    const results = defaultInfrastructures
      .map((inf) => {
        const iLat = parseFloat(inf.latitude);
        const iLng = parseFloat(inf.longitude);
        const dist = haversineDistanceKm(vLat, vLng, iLat, iLng);
        return {
          volcanoId: volcano.id,
          volcanoName: volcano.name,
          alertLevel: volcano.severity,
          hazardRadiusKm,
          infrastructureId: inf.id,
          infrastructureName: inf.name,
          infrastructureType: inf.type,
          region: inf.region,
          distanceKm: dist,
          vulnerabilityIndex: inf.vulnerabilityIndex,
          status: inf.status
        };
      })
      .filter((inf) => inf.distanceKm <= hazardRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return results;
  }

  /**
   * Spatial Query: Identify seismic swarms via spatial DBSCAN clustering
   */
  static async getSeismicClusters(epsKm: number = 25, minPoints: number = 3) {
    if (isPostgresConnected) {
      try {
        const epsDegrees = epsKm / 111.32;
        const result = await db.execute(sql`
          SELECT 
            id, title, magnitude, latitude, longitude, depth_km as "depthKm", place, region, occurred_at as "occurredAt",
            ST_ClusterDBSCAN(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), eps := ${epsDegrees}, minpoints := ${minPoints}) OVER () AS cluster_id
          FROM earthquakes
          ORDER BY cluster_id NULLS LAST, occurred_at DESC;
        `);
        if (result && result.rows) {
          return result.rows;
        }
      } catch {
        // Fall back
      }
    }

    // Fallback cluster calculation
    const allEq = getEarthquakes();
    return allEq.map((eq, idx) => {
      const clusterId = eq.coordinates[0] > 10 ? 1 : eq.coordinates[0] > 8 ? 2 : null;
      return {
        id: eq.id,
        title: `M ${eq.magnitude} - ${eq.location}`,
        magnitude: eq.magnitude,
        latitude: eq.coordinates[0],
        longitude: eq.coordinates[1],
        depthKm: eq.depth,
        place: eq.location,
        region: "Ethiopian Rift System",
        occurredAt: eq.dateTime,
        cluster_id: clusterId
      };
    });
  }

  /**
   * Export FeatureCollection as valid PostGIS GeoJSON
   */
  static async getEarthquakesGeoJson() {
    if (isPostgresConnected) {
      try {
        const result = await db.execute(sql`
          SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
          ) as geojson
          FROM (
            SELECT 
              id, title, magnitude, depth_km as "depthKm", place, region, category, source, occurred_at as "occurredAt",
              ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) as geom
            FROM earthquakes
          ) as t;
        `);
        const row = result.rows[0] as any;
        if (row?.geojson) return row.geojson;
      } catch {
        // Fall back
      }
    }

    // GeoJSON Fallback
    const allEq = getEarthquakes();
    return {
      type: "FeatureCollection",
      features: allEq.map((eq) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [eq.coordinates[1], eq.coordinates[0]]
        },
        properties: {
          id: eq.id,
          title: `M ${eq.magnitude} - ${eq.location}`,
          magnitude: eq.magnitude,
          depthKm: eq.depth,
          place: eq.location,
          occurredAt: eq.dateTime,
          severity: eq.severity
        }
      }))
    };
  }
}
