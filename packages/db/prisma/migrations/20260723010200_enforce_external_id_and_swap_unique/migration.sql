-- Requires: scripts/backfill-external-id.ts has already run and confirmed
-- zero NULL externalId rows on both tables.

ALTER TABLE "PluginConnection" ALTER COLUMN "externalId" SET NOT NULL;
ALTER TABLE "AccountConnection" ALTER COLUMN "externalId" SET NOT NULL;

-- This is the actual fix: one repo/package per plugin per product goes away,
-- replaced by "the same external resource, reconnected, edits in place."
DROP INDEX "PluginConnection_productId_pluginSlug_key";
CREATE UNIQUE INDEX "PluginConnection_productId_pluginSlug_externalId_key"
  ON "PluginConnection"("productId", "pluginSlug", "externalId");
