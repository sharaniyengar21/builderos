export type PluginAuthStrategy =
  | { type: "none" }
  | { type: "pat"; label: string; helpUrl?: string }
  | { type: "basic"; usernameLabel: string; passwordLabel: string; helpUrl?: string }
  | { type: "oauth2"; authorizeUrl: string; tokenUrl: string; scopes: string[] };

export interface PluginConfigField {
  name: string;
  label: string;
  placeholder?: string;
}

export interface PluginMetadata {
  slug: string;
  name: string;
  description: string;
  auth: PluginAuthStrategy;
  // Raw form fields connect() needs — e.g. GitHub: a repo URL; npm: a
  // package name. connect() is responsible for parsing/normalizing these
  // into whatever internal `config` shape it actually persists.
  configFields: PluginConfigField[];
  // Which metric key is the headline number shown compactly on the home
  // dashboard, without rendering the plugin's full widget.
  primaryMetricKey: string;
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
  // Absent for account-wide connections, which have no product.
  productId?: string;
  config: Record<string, unknown>;
  getCredential: () => Promise<string | null>;
}

export interface ActionContext extends PluginConnectionContext {
  input: Record<string, unknown>;
}

export interface PluginConnectInput {
  productId?: string;
  config: Record<string, unknown>;
  credential?: string;
}

export interface PluginConnectResult {
  // Canonical identity of the external resource ("owner/repo", a package
  // name, a project/zone id, or a constant like "primary" for plugins with
  // no natural external identity). Lets the caller tell "reconnecting the
  // same thing" apart from "connecting something new" without any
  // plugin-specific logic outside the plugin itself.
  externalId: string;
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
