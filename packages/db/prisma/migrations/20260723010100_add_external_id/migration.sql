-- Add externalId, nullable for now — backfilled by scripts/backfill-external-id.ts
-- before the next migration makes it NOT NULL.

ALTER TABLE "PluginConnection" ADD COLUMN "externalId" TEXT;
ALTER TABLE "AccountConnection" ADD COLUMN "externalId" TEXT;
