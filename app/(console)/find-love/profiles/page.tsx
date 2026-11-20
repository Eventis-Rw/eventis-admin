import { requireAdmin } from "@/lib/session";
import { apiFetch, toResult } from "@/lib/api";
import type { PhotoModerationItem } from "@/lib/find-love/types";
import { USE_MOCK_DATA } from "@/lib/config";
import { ErrorState } from "@/components/ui/states";
import type { Metadata } from "next";

import { ProfilesView } from "@/components/find-love/profiles-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Profiles & Photo Moderation — FindLove Admin",
  description:
    "Moderate user profile pictures and gallery images to maintain trust and safety standards.",
};

export default async function FindLoveProfilesPage() {
  const { token } = await requireAdmin();
  const result = USE_MOCK_DATA
    ? { ok: true as const, data: getFindLoveStore().photos }
    : await toResult(() =>
        apiFetch<PhotoModerationItem[]>("/admin/findlove/photos", { token }),
      );
  if (!result.ok)
    return (
      <ErrorState title="Could not load profiles" message={result.error} />
    );

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Profiles & Photo Moderation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member portraits and gallery uploads, flag inappropriate
          images, and prevent impersonation.
        </p>
      </div>

      <ProfilesView photos={result.data} live={!USE_MOCK_DATA} />
    </div>
  );
}
