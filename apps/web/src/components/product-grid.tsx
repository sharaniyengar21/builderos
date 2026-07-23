"use client";

import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import { Card } from "./ui/card";
import { MetricChip, type MetricChipData } from "./metric-chip";

export interface ProductListItem {
  id: string;
  name: string;
  chips: MetricChipData[];
}

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={container}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((product) => (
        <motion.a key={product.id} variants={item} href={`/products/${product.id}`}>
          <Card className="h-full transition-colors duration-150 hover:border-white/[0.15] hover:bg-white/[0.05]">
            <Folder className="h-5 w-5 text-accent-electric" />
            <p className="mt-3 truncate text-sm font-medium text-ink-primary">{product.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.chips.length === 0 ? (
                <span className="text-xs text-ink-muted">No integrations connected</span>
              ) : (
                product.chips.map((chip) => <MetricChip key={chip.pluginSlug} {...chip} />)
              )}
            </div>
          </Card>
        </motion.a>
      ))}
    </motion.div>
  );
}
