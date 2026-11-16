"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { moderatePhotoAction } from "@/lib/find-love/actions";
import type {
  PhotoModerationItem,
  PhotoModerationStatus,
} from "@/lib/find-love/types";

interface ProfilesViewProps {
  photos: PhotoModerationItem[];
  live?: boolean;
}

export function ProfilesView({
  photos: initialPhotos,
  live,
}: ProfilesViewProps) {
  const [photos, setPhotos] = useState<PhotoModerationItem[]>(initialPhotos);
  const [filter, setFilter] = useState<PhotoModerationStatus | "all">("all");
  const [selectedPhoto, setSelectedPhoto] =
    useState<PhotoModerationItem | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const pendingPhotos = photos.filter((p) => p.status === "pending").length;
  const flaggedPhotos = photos.filter((p) => p.status === "flagged").length;
  const approvedPhotos = photos.filter((p) => p.status === "approved").length;
  const rejectedPhotos = photos.filter((p) => p.status === "rejected").length;

  const filtered = photos.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    return true;
  });

  const handleModerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("photoId", selectedPhoto.id);
      formData.set("status", decision);
      formData.set("reason", reason);
      formData.set("reviewer", "Moderator Grace");

      const res = await moderatePhotoAction(formData);
      if (!res.success) {
        setError(res.error ?? "Could not moderate photo");
        return;
      }
      setError("");
      if (res.success) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === selectedPhoto.id
              ? {
                  ...p,
                  status: decision,
                  reason,
                  reviewedAt: new Date().toISOString(),
                }
              : p,
          ),
        );
        setSelectedPhoto(null);
        setReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {/* Top Stat Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Photos Awaiting Review
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">
            {pendingPhotos}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            New member uploads
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Flagged by Community
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
            {flaggedPhotos}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Reported for review
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Approved Photos
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">
            {approvedPhotos}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Verified authentic content
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Removed This Month
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {rejectedPhotos}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Policy violations
          </p>
        </Card>
      </section>

      {/* Filter Bar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-foreground">
          Filter Moderation Queue
        </span>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as PhotoModerationStatus | "all")
            }
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Photos ({photos.length})</option>
            <option value="pending">Pending ({pendingPhotos})</option>
            <option value="flagged">Flagged ({flaggedPhotos})</option>
            <option value="approved">Approved ({approvedPhotos})</option>
            <option value="rejected">Rejected ({rejectedPhotos})</option>
          </select>
        </div>
      </Card>

      {/* Photo Gallery Grid */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((photo) => (
          <Card
            key={photo.id}
            className="flex items-center gap-3 p-2.5 transition-colors hover:bg-muted/40"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-900">
              <Image
                src={photo.url}
                unoptimized={live}
                alt={`Photo for ${photo.userName}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/find-love/users/${photo.userId}`}
                className="block truncate text-xs font-semibold text-foreground hover:text-primary"
                title={photo.userName}
              >
                {photo.userName}
              </Link>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {photo.userId}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Badge
                  tone={
                    photo.status === "approved"
                      ? "success"
                      : photo.status === "flagged"
                        ? "danger"
                        : photo.status === "pending"
                          ? "warning"
                          : "neutral"
                  }
                  dot
                >
                  {photo.status}
                </Badge>
                <Badge tone="neutral" className="bg-black/60 text-white">
                  {photo.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(photo.uploadedAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {photo.reason ? (
                <p
                  className="mt-1 truncate text-[10px] text-destructive"
                  title={photo.reason}
                >
                  {photo.reason}
                </p>
              ) : null}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="h-7 shrink-0 px-2 text-[11px]"
              onClick={() => {
                setSelectedPhoto(photo);
                setDecision(
                  photo.status === "pending" || photo.status === "flagged"
                    ? "approved"
                    : photo.status,
                );
                setReason(photo.reason || "");
              }}
            >
              Moderate
            </Button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No photos found under the selected filter.
        </Card>
      )}

      {/* Moderation Dialog */}
      {selectedPhoto && (
        <Dialog
          open={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          title="Review Photo Authenticity"
          description={`Member: ${selectedPhoto.userName} (${selectedPhoto.userId})`}
        >
          <form onSubmit={handleModerateSubmit} className="space-y-4 pt-2">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
              <Image
                src={selectedPhoto.url}
                unoptimized={live}
                alt="Uploaded Image"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Moderation Decision
              </label>
              <select
                value={decision}
                onChange={(e) =>
                  setDecision(e.target.value as "approved" | "rejected")
                }
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="approved">
                  Approve Photo (Publish to Profile)
                </option>
                <option value="rejected">
                  Reject Photo (Remove from Profile)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Reason / Feedback{" "}
                {decision === "rejected" ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                required={decision === "rejected"}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State policy rationale (e.g. Inappropriate nudity, copyrighted content, watermark, celebrity impersonation)..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setSelectedPhoto(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={decision === "approved" ? "primary" : "destructive"}
                loading={isPending}
              >
                Save Decision
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
