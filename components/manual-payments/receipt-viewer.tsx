"use client";

import { useEffect, useState } from "react";
import { ImageOff, Loader2, ZoomIn } from "lucide-react";

import { Dialog } from "@/components/ui/overlay";

/**
 * Loads an admin's uploaded payment screenshot through the same-origin proxy
 * at /api/manual-payments/[id]/receipt (see that route for why: the access
 * token is httpOnly and the API has no CORS policy, so the browser cannot
 * attach the Authorization header itself). The response is turned into a
 * blob URL for display and a small lightbox to view it larger; the object
 * URL is revoked on unmount to avoid leaking memory.
 */
export function ReceiptViewer({ uploadId }: { uploadId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    fetch(`/api/manual-payments/${uploadId}/receipt`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uploadId]);

  return (
    <>
      <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        ) : error || !url ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden />
            <p className="text-xs">Could not load the payment screenshot.</p>
          </div>
        ) : (
          <button
            type="button"
            className="group relative block h-full w-full"
            onClick={() => setOpen(true)}
            aria-label="View payment screenshot larger"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL, next/image cannot optimize it */}
            <img src={url} alt="Payment proof screenshot" className="h-full w-full object-contain" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white" aria-hidden />
            </span>
          </button>
        )}
      </div>

      {url ? (
        <Dialog open={open} onClose={() => setOpen(false)} title="Payment screenshot">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL, next/image cannot optimize it */}
          <img src={url} alt="Payment proof screenshot, enlarged" className="max-h-[75vh] w-full object-contain" />
        </Dialog>
      ) : null}
    </>
  );
}
