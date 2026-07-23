-- Pure rename: Workspace -> Product, PluginConnection.workspaceId -> productId
-- Zero data risk, no rows touched.

ALTER TABLE "Workspace" RENAME TO "Product";
ALTER TABLE "PluginConnection" RENAME COLUMN "workspaceId" TO "productId";

ALTER TABLE "Product" RENAME CONSTRAINT "Workspace_pkey" TO "Product_pkey";
ALTER TABLE "Product" RENAME CONSTRAINT "Workspace_ownerId_fkey" TO "Product_ownerId_fkey";
ALTER INDEX "Workspace_slug_key" RENAME TO "Product_slug_key";
ALTER INDEX "Workspace_ownerId_name_key" RENAME TO "Product_ownerId_name_key";

ALTER TABLE "PluginConnection" RENAME CONSTRAINT "PluginConnection_workspaceId_fkey" TO "PluginConnection_productId_fkey";
ALTER INDEX "PluginConnection_workspaceId_pluginSlug_key" RENAME TO "PluginConnection_productId_pluginSlug_key";
