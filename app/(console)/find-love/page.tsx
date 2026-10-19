import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Find Love" };

export default function FindLovePage() {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto mb-4 inline-flex rounded-2xl bg-info-soft p-3 text-primary">
        <Heart className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-bold">Find Love dashboard</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This workspace is reserved for Find Love management and is not built yet. It will have its own navigation, data and permissions,
        separate from Eventis, while sharing this console&apos;s sign-in and layout.
      </p>
    </Card>
  );
}
