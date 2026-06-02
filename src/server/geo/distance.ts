export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapMarkerType = "ROOM" | "PROPERTY" | "POI" | "USER_LOCATION";

export type MapMarkerDto = Coordinates & {
  id: string;
  type: MapMarkerType;
  title: string;
  slug?: string;
  address?: string;
  distanceKm?: number;
};

export type MapViewportDto = {
  center: Coordinates;
  radiusKm: number;
  markers: MapMarkerDto[];
};

export type RadiusBounds = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

const EARTH_RADIUS_KM = 6371.0088;
const KM_PER_DEGREE_LATITUDE = 111.32;

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function isValidLatitude(latitude: number) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: number) {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

export function isValidCoordinates(coordinates: Coordinates) {
  return isValidLatitude(coordinates.latitude) && isValidLongitude(coordinates.longitude);
}

export function calculateDistanceKm(origin: Coordinates, destination: Coordinates) {
  if (!isValidCoordinates(origin) || !isValidCoordinates(destination)) {
    return null;
  }

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number((EARTH_RADIUS_KM * centralAngle).toFixed(3));
}

export function getRadiusBounds(center: Coordinates, radiusKm: number): RadiusBounds {
  const latitudeDelta = radiusKm / KM_PER_DEGREE_LATITUDE;
  const longitudeDelta = radiusKm / (KM_PER_DEGREE_LATITUDE * Math.cos(toRadians(center.latitude)) || KM_PER_DEGREE_LATITUDE);

  return {
    minLatitude: center.latitude - latitudeDelta,
    maxLatitude: center.latitude + latitudeDelta,
    minLongitude: center.longitude - longitudeDelta,
    maxLongitude: center.longitude + longitudeDelta,
  };
}

export function createMapViewport(center: Coordinates, radiusKm: number, markers: MapMarkerDto[]): MapViewportDto {
  return { center, radiusKm, markers };
}
