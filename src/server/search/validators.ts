import { z } from "zod";

import { PointOfInterestCategory, RoomStatus } from "@/generated/prisma/enums";

const nullableNumberFromQuery = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return Number(value);
}, z.number().finite().optional());

const positiveNumberFromQuery = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return Number(value);
}, z.number().positive().finite().optional());

const integerFromQuery = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return Number(value);
}, z.number().int().positive().max(100).optional());

const csvArray = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().min(1)).optional());

export const searchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(120).optional(),
    city: z.string().trim().min(1).max(80).optional(),
    district: z.string().trim().min(1).max(80).optional(),
    ward: z.string().trim().min(1).max(80).optional(),
    poi: z.string().trim().min(1).max(120).optional(),
    address: z.string().trim().min(1).max(180).optional(),
    minPrice: positiveNumberFromQuery,
    maxPrice: positiveNumberFromQuery,
    minArea: positiveNumberFromQuery,
    maxArea: positiveNumberFromQuery,
    capacity: integerFromQuery,
    status: z.enum(RoomStatus).optional(),
    amenities: csvArray,
    furnishings: csvArray,
    latitude: nullableNumberFromQuery,
    longitude: nullableNumberFromQuery,
    radius: positiveNumberFromQuery.pipe(z.number().max(20)).default(5),
    page: integerFromQuery.default(1),
    limit: integerFromQuery.default(20),
  })
  .refine((data) => data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice, {
    message: "minPrice must be less than or equal to maxPrice",
    path: ["minPrice"],
  })
  .refine((data) => data.minArea === undefined || data.maxArea === undefined || data.minArea <= data.maxArea, {
    message: "minArea must be less than or equal to maxArea",
    path: ["minArea"],
  });

export const suggestionsQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: integerFromQuery.default(10),
});

export const nearbyQuerySchema = z.object({
  latitude: z.preprocess((value) => Number(value), z.number().min(-90).max(90)),
  longitude: z.preprocess((value) => Number(value), z.number().min(-180).max(180)),
  radius: positiveNumberFromQuery.pipe(z.number().max(20)).default(5),
  limit: integerFromQuery.default(20),
});

export const poiSearchQuerySchema = searchQuerySchema.safeExtend({
  category: z.enum(PointOfInterestCategory).optional(),
  poi: z.string().trim().min(1).max(120),
});

export const landingPageQuerySchema = z.object({
  path: z.string().trim().min(1).max(160).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  limit: integerFromQuery.default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SuggestionsQuery = z.infer<typeof suggestionsQuerySchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type PoiSearchQuery = z.infer<typeof poiSearchQuerySchema>;
export type LandingPageQuery = z.infer<typeof landingPageQuerySchema>;
