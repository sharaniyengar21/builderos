import { Container, CreditCard, MessageSquare } from "lucide-react";
import { comingSoonIntegrations, type ComingSoonIntegration } from "@/lib/coming-soon-integrations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<ComingSoonIntegration["iconName"], typeof Container> = {
  Container,
  CreditCard,
  MessageSquare,
};

export function IntegrationsGrid() {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-ink-secondary">More integrations</h2>
      <p className="mt-1 text-xs text-ink-muted">Coming soon — connect these to expand your workspace.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {comingSoonIntegrations.map((integration) => {
          const Icon = ICONS[integration.iconName];
          return (
            <Card key={integration.slug} className="cursor-default opacity-60">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-ink-muted" />
                <Badge tone="coming-soon">Coming soon</Badge>
              </div>
              <p className="mt-3 text-sm font-medium text-ink-secondary">{integration.name}</p>
              <p className="mt-1 text-xs text-ink-muted">{integration.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
