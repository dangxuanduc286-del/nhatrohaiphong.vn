import { z } from "zod";

export const idSchema = z.object({ id: z.string().min(1) });

export const statusSchema = z.object({ status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]) });

export const userStatusUpdateSchema = idSchema.merge(statusSchema);

export const roomModerationSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "HIDE", "LOCK", "REOPEN", "MAINTENANCE", "OCCUPIED", "RESERVED"]),
  reason: z.string().trim().max(500).optional(),
});

export const roleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9.-]+$/),
  description: z.string().trim().max(255).optional().nullable(),
  permissionIds: z.array(z.string().min(1)).default([]),
});

export const permissionAssignSchema = z.object({
  roleIds: z.array(z.string().min(1)).default([]),
});

export const landingPageSchema = z.object({
  path: z.string().trim().min(1).max(255),
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(1).max(255),
  cityId: z.string().min(1).nullable().optional(),
  districtId: z.string().min(1).nullable().optional(),
  poiId: z.string().min(1).nullable().optional(),
  content: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
  seo: z
    .object({
      metaTitle: z.string().trim().min(1).max(255),
      metaDescription: z.string().trim().max(500).optional().nullable(),
      canonicalUrl: z.string().trim().url().optional().nullable(),
      keywords: z.array(z.string().trim().min(1)).default([]),
    })
    .optional(),
});

export const poiSchema = z.object({
  cityId: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(1).max(255),
  category: z.enum(["INDUSTRIAL_PARK", "PORT", "AIRPORT", "UNIVERSITY", "HOSPITAL", "TRANSPORT", "SHOPPING_MALL", "TOURISM", "RESIDENTIAL_AREA"]),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  description: z.string().nullable().optional(),
});

export const citySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(120),
  code: z.string().trim().min(1).max(20),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const districtSchema = z.object({
  cityId: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(120),
  description: z.string().nullable().optional(),
});

export const wardSchema = z.object({
  districtId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(120),
});

export const blogSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(1).max(255),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1),
  coverImage: z.string().url().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export const bannerSchema = z.object({
  landingPageId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(2).max(255),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});
