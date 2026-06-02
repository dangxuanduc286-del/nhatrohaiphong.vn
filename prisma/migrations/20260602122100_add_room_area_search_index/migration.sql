-- Add area search index for Prompt 05.1 search hardening.
CREATE INDEX "rooms_area_status_deleted_at_idx" ON "rooms"("area", "status", "deletedAt");
