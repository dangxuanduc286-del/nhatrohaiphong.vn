-- Enforce the production RBAC policy: one user has exactly one role.
-- Keep the earliest assigned role for existing multi-role users before changing the key.
DELETE FROM "user_roles" ur
USING (
  SELECT "userId", "roleId", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" ASC, "roleId" ASC) AS rn
  FROM "user_roles"
) ranked
WHERE ur."userId" = ranked."userId"
  AND ur."roleId" = ranked."roleId"
  AND ranked.rn > 1;

ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId");
