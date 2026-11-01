"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { moderatePhotoAction } from "@/lib/find-love/actions";
import type { PhotoModerationItem, PhotoModerationStatus } from "@/lib/find-love/types";

interface ProfilesViewProps {
  photos: PhotoModerationItem[];
}

export function ProfilesView({ photos: initialPhotos }: ProfilesViewProps) {
  const [photos, setPhotos] = useState<PhotoModerationItem[]>(initialPhotos);
  const [filter, setFilter] = useState<PhotoModerationStatus | "all">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoModerationItem | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [reason, setReason] = useState("");
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
      if (res.success) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === selectedPhoto.id ? { ...p, status: decision, reason, reviewedAt: new Date().toISOString() } : p,
          ),
        );
        setSelectedPhoto(null);
        setReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Photos Awaiting Review</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">{pendingPhotos}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">New member uploads</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Flagged by Community</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{flaggedPhotos}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Reported for review</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Approved Photos</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{approvedPhotos}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Verified authentic content</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Removed This Month</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{rejectedPhotos}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Policy violations</p>
        </Card>
      </section>

      {/* Filter Bar */}
      <Card className="flex items-center justify-between p-4">
        <span className="text-sm font-semibold text-foreground">Filter Moderation Queue</span>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PhotoModerationStatus | "all")}
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
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((photo) => (
          <Card key={photo.id} className="overflow-hidden flex flex-col group">
            <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
              <Image
                src={photo.url}
                alt={`Photo for ${photo.userName}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute top-2 left-2 flex gap-1.5">
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
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/find-love/users/${photo.userId}`} className="font-semibold text-sm text-foreground hover:text-primary">
                  {photo.userName}
                </Link>
                <p className="text-xs text-muted-foreground font-mono">{photo.userId}</p>
                {photo.reason ? (
                  <p className="mt-2 text-xs text-destructive bg-destructive-soft p-2 rounded-lg leading-relaxed">
                    <strong>Reason:</strong> {photo.reason}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(photo.uploadedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setDecision(photo.status === "pending" || photo.status === "flagged" ? "approved" : photo.status);
                    setReason(photo.reason || "");
                  }}
                >
                  Moderate
                </Button>
              </div>
            </div>
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
              <Image src={selectedPhoto.url} alt="Uploaded Image" fill className="object-contain" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Moderation Decision</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as "approved" | "rejected")}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="approved">Approve Photo (Publish to Profile)</option>
                <option value="rejected">Reject Photo (Remove from Profile)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Reason / Feedback {decision === "rejected" ? "(Required)" : "(Optional)"}
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
              <Button variant="secondary" onClick={() => setSelectedPhoto(null)}>
                Cancel
              </Button>
              <Button type="submit" variant={decision === "approved" ? "primary" : "destructive"} loading={isPending}>
                Save Decision
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
