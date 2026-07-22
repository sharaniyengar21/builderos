export type PluginAuthStrategy =
  | { type: "pat"; label: string; helpUrl?: string }
  | { type: "oauth2"; authorizeUrl: string; tokenUrl: string; scopes: string[] };

export interface PluginMetadata {
  slug: string;
  name: string;
  description: string;
  auth: PluginAuthStrategy;
}

export interface MetricDefinition {
  key: string;
  label: string;
  unit?: "count" | "percent" | "currency" | "none";
}

export interface EventDefinition {
  key: string;
  label: string;
}

export interface WidgetDefinition {
  key: string;
  title: string;
}

export interface ActionDefinition<TOutput = unknown> {
  key: string;
  label: string;
  run: (ctx: ActionContext) => Promise<TOutput>;
}

export interface PluginConnectionContext {
  connectionId: string;
  workspaceId: string;
  config: Record<string, unknown>;
  getCredential: () => Promise<string | null>;
}

export interface ActionContext extends PluginConnectionContext {
  input: Record<string, unknown>;
}

export interface PluginConnectInput {
  workspaceId: string;
  config: Record<string, unknown>;
  credential?: string;
}

export interface PluginConnectResult {
  config: Record<string, unknown>;
  credential?: string;
}

export interface SyncResultMetric {
  key: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface SyncResultEvent {
  key: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface SyncResult {
  metrics: SyncResultMetric[];
  events?: SyncResultEvent[];
}

// Plugins never touch persistence directly — connect()/sync() return plain
// data, and the caller (an API route handler) is responsible for storing it.
// This keeps every plugin storage-agnostic and framework-agnostic.
export interface Plugin {
  metadata: PluginMetadata;
  metrics: MetricDefinition[];
  events: EventDefinition[];
  actions: ActionDefinition[];
  widgets: WidgetDefinition[];
  connect: (input: PluginConnectInput) => Promise<PluginConnectResult>;
  sync: (ctx: PluginConnectionContext) => Promise<SyncResult>;
}
