-- CreateTable
CREATE TABLE "AccountConnection" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "pluginSlug" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "config" JSONB NOT NULL DEFAULT '{}',
    "credentialsEncrypted" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountMetricSnapshot" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "kind" "SnapshotKind" NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountConnection_ownerId_pluginSlug_key" ON "AccountConnection"("ownerId", "pluginSlug");

-- CreateIndex
CREATE INDEX "AccountMetricSnapshot_connectionId_key_occurredAt_idx" ON "AccountMetricSnapshot"("connectionId", "key", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_ownerId_name_key" ON "Workspace"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "AccountConnection" ADD CONSTRAINT "AccountConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountMetricSnapshot" ADD CONSTRAINT "AccountMetricSnapshot_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "AccountConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

