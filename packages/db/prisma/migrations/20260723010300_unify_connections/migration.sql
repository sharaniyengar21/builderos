-- Fold AccountConnection/AccountMetricSnapshot into Connection/MetricSnapshot.
-- Runs as one migration file so a failure anywhere rolls back the whole
-- thing — prisma migrate deploy wraps each migration file in a transaction.

ALTER TABLE "PluginConnection" RENAME TO "Connection";
ALTER TABLE "Connection" RENAME CONSTRAINT "PluginConnection_pkey" TO "Connection_pkey";
ALTER TABLE "Connection" RENAME CONSTRAINT "PluginConnection_productId_fkey" TO "Connection_productId_fkey";
ALTER INDEX "PluginConnection_productId_pluginSlug_externalId_key" RENAME TO "Connection_productId_pluginSlug_externalId_key";

ALTER TABLE "Connection" ADD COLUMN "ownerId" TEXT;
UPDATE "Connection" c SET "ownerId" = p."ownerId" FROM "Product" p WHERE p.id = c."productId";
ALTER TABLE "Connection" ALTER COLUMN "ownerId" SET NOT NULL;
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Connection" ALTER COLUMN "productId" DROP NOT NULL;

INSERT INTO "Connection" (id, "ownerId", "productId", "pluginSlug", "externalId", status, config, "credentialsEncrypted", "lastSyncedAt", "lastSyncError", "createdAt", "updatedAt")
SELECT id, "ownerId", NULL, "pluginSlug", "externalId", status, config, "credentialsEncrypted", "lastSyncedAt", "lastSyncError", "createdAt", "updatedAt"
FROM "AccountConnection";

INSERT INTO "MetricSnapshot" (id, "connectionId", kind, key, value, metadata, "occurredAt", "createdAt")
SELECT id, "connectionId", kind, key, value, metadata, "occurredAt", "createdAt"
FROM "AccountMetricSnapshot";

-- Gate: row counts must match before dropping the old tables, or the whole
-- transaction (and this migration) rolls back.
DO $$
DECLARE
  account_count integer;
  moved_count integer;
  snapshot_account_count integer;
  snapshot_moved_count integer;
BEGIN
  SELECT count(*) INTO account_count FROM "AccountConnection";
  SELECT count(*) INTO moved_count FROM "Connection" WHERE "productId" IS NULL;
  IF account_count <> moved_count THEN
    RAISE EXCEPTION 'Connection count mismatch: % AccountConnection rows vs % moved rows', account_count, moved_count;
  END IF;

  SELECT count(*) INTO snapshot_account_count FROM "AccountMetricSnapshot";
  SELECT count(*) INTO snapshot_moved_count FROM "MetricSnapshot" ms
    JOIN "Connection" c ON c.id = ms."connectionId" AND c."productId" IS NULL;
  IF snapshot_account_count <> snapshot_moved_count THEN
    RAISE EXCEPTION 'Snapshot count mismatch: % AccountMetricSnapshot rows vs % moved rows', snapshot_account_count, snapshot_moved_count;
  END IF;
END $$;

DROP TABLE "AccountMetricSnapshot";
DROP TABLE "AccountConnection";

CREATE UNIQUE INDEX "Connection_owner_plugin_account_key" ON "Connection"("ownerId", "pluginSlug") WHERE "productId" IS NULL;
CREATE INDEX "Connection_ownerId_pluginSlug_idx" ON "Connection"("ownerId", "pluginSlug");
