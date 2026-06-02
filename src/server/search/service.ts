import type { Prisma } from "@/generated/prisma/client";
import type { PointOfInterestCategory, RoomStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { calculateDistanceKm, createMapViewport, getRadiusBounds, type Coordinates, type MapMarkerDto } from "@/server/geo/distance";
import { createCacheKey, getCachedJson, setCachedJson } from "@/server/search/cache";
import type { LandingPageQuery, NearbyQuery, PoiSearchQuery, SearchQuery, SuggestionsQuery } from "@/server/search/validators";

const SEARCH_CACHE_TTL_SECONDS = 60;
const SUGGESTION_CACHE_TTL_SECONDS = 300;
const LANDING_PAGE_CACHE_TTL_SECONDS = 300;

type RoomWithSearchRelations = Prisma.RoomGetPayload<{
  include: {
    district: { select: { id: true; name: true; slug: true; city: { select: { id: true; name: true; slug: true } } } };
    ward: { select: { id: true; name: true; slug: true } };
    building: { select: { id: true; name: true; slug: true; property: { select: { id: true; name: true; slug: true } } } };
    images: { where: { deletedAt: null }; orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]; take: 1; select: { url: true; altText: true } };
    amenities: { include: { amenity: { select: { id: true; name: true; slug: true; icon: true } } } };
  };
}>;

type RoomDto = {
  id: string;
  roomCode: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  area: number;
  capacity: number;
  status: RoomStatus;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm?: number;
  district: { id: string; name: string; slug: string; city: { id: string; name: string; slug: string } | null };
  ward: { id: string; name: string; slug: string };
  building: { id: string; name: string; slug: string; property: { id: string; name: string; slug: string } };
  primaryImage: { url: string; altText: string | null } | null;
  amenities: { id: string; name: string; slug: string; icon: string | null }[];
};

type LandingPageSearchTarget = {
  key: string;
  districtSlug?: string;
  poiSlug?: string;
};

function toNumber(value: { toString(): string } | number | null) {
  return value === null ? null : Number(value.toString());
}

function parseSearchParams(request: Request) {
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams.entries());
}

function getTextConditions(query?: string) {
  if (!query) {
    return [];
  }

  return [
    { title: { contains: query, mode: "insensitive" as const } },
    { description: { contains: query, mode: "insensitive" as const } },
    { address: { contains: query, mode: "insensitive" as const } },
    { district: { name: { contains: query, mode: "insensitive" as const } } },
    { ward: { name: { contains: query, mode: "insensitive" as const } } },
    { building: { name: { contains: query, mode: "insensitive" as const } } },
    { amenities: { some: { amenity: { name: { contains: query, mode: "insensitive" as const } } } } },
  ];
}

function buildRoomWhere(query: SearchQuery): Prisma.RoomWhereInput {
  const where: Prisma.RoomWhereInput = {
    deletedAt: null,
    status: query.status ?? "AVAILABLE",
  };

  const and: Prisma.RoomWhereInput[] = [];
  const textConditions = getTextConditions(query.q);

  if (textConditions.length > 0) {
    and.push({ OR: textConditions });
  }

  if (query.city) {
    and.push({ district: { city: { OR: [{ name: { contains: query.city, mode: "insensitive" } }, { slug: query.city }] } } });
  }

  if (query.district) {
    and.push({ district: { OR: [{ name: { contains: query.district, mode: "insensitive" } }, { slug: query.district }] } });
  }

  if (query.ward) {
    and.push({ ward: { OR: [{ name: { contains: query.ward, mode: "insensitive" } }, { slug: query.ward }] } });
  }

  if (query.address) {
    and.push({ address: { contains: query.address, mode: "insensitive" } });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = { gte: query.minPrice, lte: query.maxPrice };
  }

  if (query.minArea !== undefined || query.maxArea !== undefined) {
    where.area = { gte: query.minArea, lte: query.maxArea };
  }

  if (query.capacity !== undefined) {
    where.capacity = { gte: query.capacity };
  }

  if (query.amenities?.length) {
    and.push({ amenities: { some: { amenity: { slug: { in: query.amenities } } } } });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

function roomInclude() {
  return {
    district: { select: { id: true, name: true, slug: true, city: { select: { id: true, name: true, slug: true } } } },
    ward: { select: { id: true, name: true, slug: true } },
    building: { select: { id: true, name: true, slug: true, property: { select: { id: true, name: true, slug: true } } } },
    images: { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }], take: 1, select: { url: true, altText: true } },
    amenities: { include: { amenity: { select: { id: true, name: true, slug: true, icon: true } } } },
  } satisfies Prisma.RoomInclude;
}

function toRoomDto(room: RoomWithSearchRelations, origin?: Coordinates): RoomDto {
  const latitude = toNumber(room.latitude);
  const longitude = toNumber(room.longitude);
  const distanceKm = origin && latitude !== null && longitude !== null ? calculateDistanceKm(origin, { latitude, longitude }) : null;

  return {
    id: room.id,
    roomCode: room.roomCode,
    title: room.title,
    slug: room.slug,
    description: room.description,
    price: Number(room.price.toString()),
    area: Number(room.area.toString()),
    capacity: room.capacity,
    status: room.status,
    address: room.address,
    latitude,
    longitude,
    ...(distanceKm !== null ? { distanceKm } : {}),
    district: room.district,
    ward: room.ward,
    building: room.building,
    primaryImage: room.images[0] ?? null,
    amenities: room.amenities.map((item) => item.amenity),
  };
}

function toRoomMarker(room: RoomDto): MapMarkerDto | null {
  if (room.latitude === null || room.longitude === null) {
    return null;
  }

  return {
    id: room.id,
    type: "ROOM",
    title: room.title,
    slug: room.slug,
    address: room.address,
    latitude: room.latitude,
    longitude: room.longitude,
    distanceKm: room.distanceKm,
  };
}

async function findPoiByQuery(query: string, category?: PointOfInterestCategory) {
  return db.pointOfInterest.findFirst({
    where: {
      deletedAt: null,
      ...(category ? { category } : {}),
      OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: query }],
    },
    orderBy: { name: "asc" },
  });
}

export function getSearchParamsFromRequest(request: Request) {
  return parseSearchParams(request);
}

export async function searchRooms(query: SearchQuery) {
  const cacheKey = createCacheKey("rooms", query);
  const cached = await getCachedJson<Awaited<ReturnType<typeof executeRoomSearch>>>(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await executeRoomSearch(query);
  await setCachedJson(cacheKey, data, SEARCH_CACHE_TTL_SECONDS);
  return data;
}

async function executeRoomSearch(query: SearchQuery) {
  const origin = query.latitude !== undefined && query.longitude !== undefined ? { latitude: query.latitude, longitude: query.longitude } : undefined;
  const where = buildRoomWhere(query);

  if (query.poi) {
    const category = ("category" in query ? query.category : undefined) as PointOfInterestCategory | undefined;
    const poi = await findPoiByQuery(query.poi, category);

    if (!poi) {
      return { items: [], total: 0, page: query.page, limit: query.limit, map: origin ? createMapViewport(origin, query.radius, []) : null, poi: null };
    }

    const poiOrigin = { latitude: Number(poi.latitude.toString()), longitude: Number(poi.longitude.toString()) };
    const bounds = getRadiusBounds(poiOrigin, query.radius);
    where.latitude = { gte: bounds.minLatitude, lte: bounds.maxLatitude };
    where.longitude = { gte: bounds.minLongitude, lte: bounds.maxLongitude };
    const rooms = await db.room.findMany({ where, include: roomInclude(), orderBy: { updatedAt: "desc" }, take: Math.min(query.limit * 4, 100) });
    const items = rooms
      .map((room) => toRoomDto(room, poiOrigin))
      .filter((room) => room.distanceKm !== undefined && room.distanceKm <= query.radius)
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
      .slice((query.page - 1) * query.limit, query.page * query.limit);
    const markers = items.map(toRoomMarker).filter((marker): marker is MapMarkerDto => marker !== null);

    return { items, total: items.length, page: query.page, limit: query.limit, map: createMapViewport(poiOrigin, query.radius, markers), poi };
  }

  if (origin) {
    const bounds = getRadiusBounds(origin, query.radius);
    where.latitude = { gte: bounds.minLatitude, lte: bounds.maxLatitude };
    where.longitude = { gte: bounds.minLongitude, lte: bounds.maxLongitude };
  }

  const [total, rooms] = await Promise.all([
    db.room.count({ where }),
    db.room.findMany({ where, include: roomInclude(), orderBy: { updatedAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
  ]);
  const items = rooms.map((room) => toRoomDto(room, origin));
  const nearbyItems = origin ? items.filter((room) => room.distanceKm !== undefined && room.distanceKm <= query.radius).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)) : items;
  const markers = nearbyItems.map(toRoomMarker).filter((marker): marker is MapMarkerDto => marker !== null);

  return { items: nearbyItems, total, page: query.page, limit: query.limit, map: origin ? createMapViewport(origin, query.radius, markers) : null, poi: null };
}

export async function nearbySearch(query: NearbyQuery) {
  return searchRooms({ latitude: query.latitude, longitude: query.longitude, radius: query.radius, limit: query.limit, page: 1, status: "AVAILABLE" });
}

export async function poiSearch(query: PoiSearchQuery) {
  return searchRooms(query);
}

export async function getSuggestions(query: SuggestionsQuery) {
  const cacheKey = createCacheKey("suggestions", query);
  const cached = await getCachedJson<unknown[]>(cacheKey);

  if (cached) {
    return { items: cached };
  }

  const contains = { contains: query.q, mode: "insensitive" as const };
  const [districts, wards, pois, landingPages] = await Promise.all([
    db.district.findMany({ where: { deletedAt: null, name: contains }, take: query.limit, select: { id: true, name: true, slug: true } }),
    db.ward.findMany({ where: { deletedAt: null, name: contains }, take: query.limit, select: { id: true, name: true, slug: true } }),
    db.pointOfInterest.findMany({ where: { deletedAt: null, name: contains }, take: query.limit, select: { id: true, name: true, slug: true, category: true } }),
    db.landingPage.findMany({ where: { deletedAt: null, isPublished: true, title: contains }, take: query.limit, select: { id: true, title: true, slug: true, path: true } }),
  ]);

  const items = [
    ...districts.map((item) => ({ type: "DISTRICT", ...item })),
    ...wards.map((item) => ({ type: "WARD", ...item })),
    ...pois.map((item) => ({ type: "POI", ...item })),
    ...landingPages.map((item) => ({ type: "LANDING_PAGE", name: item.title, ...item })),
  ].slice(0, query.limit);

  await setCachedJson(cacheKey, items, SUGGESTION_CACHE_TTL_SECONDS);
  return { items };
}

async function batchLandingPageRoomSearch(targets: LandingPageSearchTarget[]) {
  const uniqueTargets = Array.from(new Map(targets.map((target) => [target.key, target])).values());

  if (uniqueTargets.length === 0) {
    return new Map<string, Awaited<ReturnType<typeof searchRooms>>>();
  }

  const districtSlugs = uniqueTargets.map((target) => target.districtSlug).filter((slug): slug is string => Boolean(slug));
  const poiSlugs = uniqueTargets.map((target) => target.poiSlug).filter((slug): slug is string => Boolean(slug));
  const [pois, rooms] = await Promise.all([
    poiSlugs.length
      ? db.pointOfInterest.findMany({ where: { deletedAt: null, slug: { in: poiSlugs } }, select: { id: true, slug: true, latitude: true, longitude: true } })
      : Promise.resolve([]),
    db.room.findMany({
      where: {
        deletedAt: null,
        status: "AVAILABLE",
        OR: [
          ...(districtSlugs.length ? [{ district: { slug: { in: districtSlugs } } }] : []),
          ...(poiSlugs.length
            ? [
                {
                  latitude: { not: null },
                  longitude: { not: null },
                },
              ]
            : []),
        ],
      },
      include: roomInclude(),
      orderBy: { updatedAt: "desc" },
      take: Math.min(uniqueTargets.length * 24, 300),
    }),
  ]);
  const poiBySlug = new Map(pois.map((poi) => [poi.slug, { latitude: Number(poi.latitude.toString()), longitude: Number(poi.longitude.toString()) }]));
  const result = new Map<string, Awaited<ReturnType<typeof searchRooms>>>();

  for (const target of uniqueTargets) {
    const origin = target.poiSlug ? poiBySlug.get(target.poiSlug) : undefined;
    const filteredRooms = rooms
      .filter((room) => {
        const districtMatch = target.districtSlug ? room.district.slug === target.districtSlug : true;
        if (!districtMatch) {
          return false;
        }

        if (!origin) {
          return true;
        }

        const latitude = toNumber(room.latitude);
        const longitude = toNumber(room.longitude);
        const distanceKm = latitude !== null && longitude !== null ? calculateDistanceKm(origin, { latitude, longitude }) : null;
        return distanceKm !== null && distanceKm <= 5;
      })
      .map((room) => toRoomDto(room, origin))
      .sort((a, b) => (origin ? (a.distanceKm ?? 0) - (b.distanceKm ?? 0) : 0))
      .slice(0, 12);
    const markers = filteredRooms.map(toRoomMarker).filter((marker): marker is MapMarkerDto => marker !== null);

    result.set(target.key, {
      items: filteredRooms,
      total: filteredRooms.length,
      page: 1,
      limit: 12,
      map: origin ? createMapViewport(origin, 5, markers) : null,
      poi: null,
    });
  }

  return result;
}

export async function getLandingPageSearch(query: LandingPageQuery) {
  const cacheKey = createCacheKey("landing-page", query);
  const cached = await getCachedJson<unknown>(cacheKey);

  if (cached) {
    return cached;
  }

  const where: Prisma.LandingPageWhereInput = {
    deletedAt: null,
    isPublished: true,
    ...(query.path ? { path: query.path } : {}),
    ...(query.slug ? { slug: query.slug } : {}),
  };
  const pages = await db.landingPage.findMany({
    where,
    take: query.limit,
    orderBy: { updatedAt: "desc" },
    include: {
      city: { select: { id: true, name: true, slug: true } },
      district: { select: { id: true, name: true, slug: true } },
      poi: { select: { id: true, name: true, slug: true, latitude: true, longitude: true, category: true } },
      seoSettings: { where: { deletedAt: null }, take: 1 },
      faqs: { where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } },
      banners: { where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  const targets = pages.map((page) => ({ key: page.id, districtSlug: page.district?.slug, poiSlug: page.poi?.slug }));
  const searches = await batchLandingPageRoomSearch(targets);
  const items = pages.map((page) => ({
    ...page,
    search: searches.get(page.id) ?? { items: [], total: 0, page: 1, limit: 12, map: null, poi: null },
  }));

  const data = { items };
  await setCachedJson(cacheKey, data, LANDING_PAGE_CACHE_TTL_SECONDS);
  return data;
}
