import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";

import { citySchema, districtSchema, landingPageSchema, permissionAssignSchema, poiSchema, roleSchema, userRoleAssignSchema, wardSchema } from "./validators";

export type AdminCrudModel = "role" | "permission" | "landingPage" | "pointOfInterest" | "city" | "district" | "ward" | "settings";

export const adminModelConfig = {
  role: { permission: "role.manage", entity: "Role" },
  permission: { permission: "role.manage", entity: "Permission" },
  landingPage: { permission: "settings.manage", entity: "LandingPage" },
  pointOfInterest: { permission: "settings.manage", entity: "PointOfInterest" },
  city: { permission: "settings.manage", entity: "City" },
  district: { permission: "settings.manage", entity: "District" },
  ward: { permission: "settings.manage", entity: "Ward" },
  settings: { permission: "settings.manage", entity: "Settings" },
} as const;

function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}

export async function createAdminRole(input: unknown, adminUserId: string) {
  const body = roleSchema.parse(input);
  return db.$transaction(async (tx) => {
    const role = await tx.role.create({ data: { name: body.name, slug: body.slug, description: body.description ?? null } });
    if (body.permissionIds.length) await tx.rolePermission.createMany({ data: body.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })), skipDuplicates: true });
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_ROLE_CREATE", entityType: "Role", entityId: role.id, newValues: body } });
    return role;
  });
}

export async function updateAdminRole(id: string, input: unknown, adminUserId: string) {
  const body = roleSchema.parse(input);
  return db.$transaction(async (tx) => {
    const existing = await tx.role.findFirst({ where: { id, deletedAt: null }, include: { permissions: true } });
    if (!existing) throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
    const role = await tx.role.update({ where: { id }, data: { name: body.name, slug: body.slug, description: body.description ?? null } });
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    if (body.permissionIds.length) await tx.rolePermission.createMany({ data: body.permissionIds.map((permissionId) => ({ roleId: id, permissionId })), skipDuplicates: true });
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_ROLE_UPDATE", entityType: "Role", entityId: id, oldValues: { name: existing.name, slug: existing.slug, permissionIds: existing.permissions.map((item) => item.permissionId) }, newValues: body } });
    return role;
  });
}

export async function softDeleteAdminRole(id: string, adminUserId: string) {
  const existing = await db.role.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
  const role = await db.role.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_ROLE_SOFT_DELETE", entityType: "Role", entityId: id, oldValues: { slug: existing.slug } } });
  return role;
}

export async function assignPermissionRoles(permissionId: string, input: unknown, adminUserId: string) {
  const body = permissionAssignSchema.parse(input);
  const existing = await db.permission.findFirst({ where: { id: permissionId, deletedAt: null }, include: { roles: true } });
  if (!existing) throw new AppError("Permission not found", 404, "PERMISSION_NOT_FOUND");
  await db.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { permissionId } });
    if (body.roleIds.length) await tx.rolePermission.createMany({ data: body.roleIds.map((roleId) => ({ roleId, permissionId })), skipDuplicates: true });
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_PERMISSION_ASSIGN_ROLES", entityType: "Permission", entityId: permissionId, oldValues: { roleIds: existing.roles.map((item) => item.roleId) }, newValues: body } });
  });
}

export async function assignUserRoles(input: unknown, adminUserId: string) {
  const body = userRoleAssignSchema.parse(input);
  const existing = await db.user.findFirst({ where: { id: body.id, deletedAt: null }, select: { id: true, email: true, roles: true } });
  if (!existing) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  const roles = body.roleIds.length ? await db.role.findMany({ where: { id: { in: body.roleIds }, deletedAt: null }, select: { id: true } }) : [];
  if (roles.length !== body.roleIds.length) throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");

  await db.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId: body.id } });
    if (body.roleIds.length) await tx.userRole.createMany({ data: body.roleIds.map((roleId) => ({ userId: body.id, roleId })), skipDuplicates: true });
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ROLE_ASSIGN", entityType: "User", entityId: body.id, oldValues: { email: existing.email, roleIds: existing.roles.map((item) => item.roleId) }, newValues: { roleIds: body.roleIds } } });
  });
}

export async function createLandingPage(input: unknown, adminUserId: string) {
  const body = landingPageSchema.parse(input);
  return db.$transaction(async (tx) => {
    const page = await tx.landingPage.create({ data: { path: body.path, title: body.title, slug: body.slug, cityId: body.cityId ?? null, districtId: body.districtId ?? null, poiId: body.poiId ?? null, content: body.content ?? null, isPublished: body.isPublished } });
    if (body.seo) await tx.sEOSetting.create({ data: { landingPageId: page.id, metaTitle: body.seo.metaTitle, metaDescription: body.seo.metaDescription ?? null, canonicalUrl: body.seo.canonicalUrl ?? null, keywords: body.seo.keywords } });
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_LANDING_PAGE_CREATE", entityType: "LandingPage", entityId: page.id, newValues: body } });
    return page;
  });
}

export async function updateLandingPage(id: string, input: unknown, adminUserId: string) {
  const body = landingPageSchema.parse(input);
  return db.$transaction(async (tx) => {
    const existing = await tx.landingPage.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError("Landing page not found", 404, "LANDING_PAGE_NOT_FOUND");
    const page = await tx.landingPage.update({ where: { id }, data: { path: body.path, title: body.title, slug: body.slug, cityId: body.cityId ?? null, districtId: body.districtId ?? null, poiId: body.poiId ?? null, content: body.content ?? null, isPublished: body.isPublished } });
    if (body.seo) {
      const seo = await tx.sEOSetting.findFirst({ where: { landingPageId: id, deletedAt: null } });
      const seoData = { metaTitle: body.seo.metaTitle, metaDescription: body.seo.metaDescription ?? null, canonicalUrl: body.seo.canonicalUrl ?? null, keywords: body.seo.keywords };
      if (seo) await tx.sEOSetting.update({ where: { id: seo.id }, data: seoData });
      else await tx.sEOSetting.create({ data: { landingPageId: id, ...seoData } });
    }
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_LANDING_PAGE_UPDATE", entityType: "LandingPage", entityId: id, oldValues: { path: existing.path, title: existing.title }, newValues: body } });
    return page;
  });
}

export async function softDeleteLandingPage(id: string, adminUserId: string) {
  const page = await db.landingPage.findFirst({ where: { id, deletedAt: null } });
  if (!page) throw new AppError("Landing page not found", 404, "LANDING_PAGE_NOT_FOUND");
  const updated = await db.landingPage.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_LANDING_PAGE_SOFT_DELETE", entityType: "LandingPage", entityId: id, oldValues: { path: page.path } } });
  return updated;
}

export async function upsertPoiSeo(tx: Prisma.TransactionClient, entityId: string, body: { name: string; description?: string | null; slug: string }) {
  const existing = await tx.sEOSetting.findFirst({ where: { entityType: "PointOfInterest", entityId, deletedAt: null } });
  const data = { entityType: "PointOfInterest", entityId, metaTitle: body.name, metaDescription: body.description ?? null, canonicalUrl: `/dia-diem/${body.slug}`, keywords: [body.name] };
  if (existing) return tx.sEOSetting.update({ where: { id: existing.id }, data });
  return tx.sEOSetting.create({ data });
}

export async function createPointOfInterest(input: unknown, adminUserId: string) {
  const body = poiSchema.parse(input);
  return db.$transaction(async (tx) => {
    const poi = await tx.pointOfInterest.create({ data: { cityId: body.cityId ?? null, name: body.name, slug: body.slug, category: body.category, latitude: body.latitude, longitude: body.longitude, description: body.description ?? null } });
    await upsertPoiSeo(tx, poi.id, body);
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_POI_CREATE", entityType: "PointOfInterest", entityId: poi.id, newValues: body } });
    return poi;
  });
}

export async function updatePointOfInterest(id: string, input: unknown, adminUserId: string) {
  const body = poiSchema.parse(input);
  return db.$transaction(async (tx) => {
    const existing = await tx.pointOfInterest.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError("POI not found", 404, "POI_NOT_FOUND");
    const poi = await tx.pointOfInterest.update({ where: { id }, data: { cityId: body.cityId ?? null, name: body.name, slug: body.slug, category: body.category, latitude: body.latitude, longitude: body.longitude, description: body.description ?? null } });
    await upsertPoiSeo(tx, id, body);
    await tx.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_POI_UPDATE", entityType: "PointOfInterest", entityId: id, oldValues: { name: existing.name, slug: existing.slug }, newValues: body } });
    return poi;
  });
}

export async function softDeletePointOfInterest(id: string, adminUserId: string) {
  const existing = await db.pointOfInterest.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("POI not found", 404, "POI_NOT_FOUND");
  const poi = await db.pointOfInterest.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_POI_SOFT_DELETE", entityType: "PointOfInterest", entityId: id, oldValues: { name: existing.name, slug: existing.slug } } });
  return poi;
}

export async function createCity(input: unknown, adminUserId: string) {
  const body = citySchema.parse(input);
  const city = await db.city.create({ data: body });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_CITY_CREATE", entityType: "City", entityId: city.id, newValues: body } });
  return city;
}

export async function updateCity(id: string, input: unknown, adminUserId: string) {
  const body = citySchema.parse(input);
  const existing = await db.city.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("City not found", 404, "CITY_NOT_FOUND");
  const city = await db.city.update({ where: { id }, data: body });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_CITY_UPDATE", entityType: "City", entityId: id, oldValues: { name: existing.name, slug: existing.slug, status: existing.status }, newValues: body } });
  return city;
}

export async function softDeleteCity(id: string, adminUserId: string) {
  const existing = await db.city.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("City not found", 404, "CITY_NOT_FOUND");
  const city = await db.city.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_CITY_SOFT_DELETE", entityType: "City", entityId: id, oldValues: { name: existing.name, slug: existing.slug } } });
  return city;
}

export async function createDistrict(input: unknown, adminUserId: string) {
  const body = districtSchema.parse(input);
  const district = await db.district.create({ data: clean({ cityId: body.cityId ?? null, name: body.name, slug: body.slug, description: body.description ?? null }) });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_DISTRICT_CREATE", entityType: "District", entityId: district.id, newValues: body } });
  return district;
}

export async function updateDistrict(id: string, input: unknown, adminUserId: string) {
  const body = districtSchema.parse(input);
  const existing = await db.district.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("District not found", 404, "DISTRICT_NOT_FOUND");
  const district = await db.district.update({ where: { id }, data: clean({ cityId: body.cityId ?? null, name: body.name, slug: body.slug, description: body.description ?? null }) });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_DISTRICT_UPDATE", entityType: "District", entityId: id, oldValues: { name: existing.name, slug: existing.slug }, newValues: body } });
  return district;
}

export async function softDeleteDistrict(id: string, adminUserId: string) {
  const existing = await db.district.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("District not found", 404, "DISTRICT_NOT_FOUND");
  const district = await db.district.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_DISTRICT_SOFT_DELETE", entityType: "District", entityId: id, oldValues: { name: existing.name, slug: existing.slug } } });
  return district;
}

export async function createWard(input: unknown, adminUserId: string) {
  const body = wardSchema.parse(input);
  const ward = await db.ward.create({ data: body });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_WARD_CREATE", entityType: "Ward", entityId: ward.id, newValues: body } });
  return ward;
}

export async function updateWard(id: string, input: unknown, adminUserId: string) {
  const body = wardSchema.parse(input);
  const existing = await db.ward.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("Ward not found", 404, "WARD_NOT_FOUND");
  const ward = await db.ward.update({ where: { id }, data: body });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_WARD_UPDATE", entityType: "Ward", entityId: id, oldValues: { name: existing.name, slug: existing.slug }, newValues: body } });
  return ward;
}

export async function softDeleteWard(id: string, adminUserId: string) {
  const existing = await db.ward.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("Ward not found", 404, "WARD_NOT_FOUND");
  const ward = await db.ward.update({ where: { id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { userId: adminUserId, action: "ADMIN_WARD_SOFT_DELETE", entityType: "Ward", entityId: id, oldValues: { name: existing.name, slug: existing.slug } } });
  return ward;
}
